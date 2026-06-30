"""
whatsapp.py — WhatsApp Reporting Channel (Twilio Sandbox Adapter)

Architecture:
  Twilio sends a POST to /api/whatsapp/webhook on every incoming message.
  This router parses the message, advances a lightweight in-memory session,
  and on the SUBMIT step calls issue_service.create_issue_from_bytes() directly.

  The business logic (Stage-0, Agents, DB writes) runs once — in issue_service.
  This file handles only WhatsApp-specific concerns:
    - Twilio request parsing / TwiML response formatting
    - Conversation session state (step, photo, location)
    - Human-readable WhatsApp message composition

Provider isolation:
  All Twilio operations are confined to the two helper functions at the top:
    _send_message(to, body) — not used for sync TwiML replies but kept for
                              future proactive notifications
    _download_media(url)    — fetches a photo from Twilio's CDN

  To migrate to Meta Cloud API: replace only those two functions and the
  webhook parsing block in whatsapp_webhook(). All session / service code is
  provider-agnostic.

Feature flag:
  WHATSAPP_ENABLED=false (default) → webhook returns 503 with a clear body.
  No crash. No side effects. Safe for production.
"""

from __future__ import annotations

import io
import logging
import threading
import time
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, Request, Response, status
from sqlmodel import Session
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from app.config import settings
from app.db import get_session
from app.services.issue_service import IssueValidationError, create_issue_from_bytes

logger = logging.getLogger("civicpulse")

router = APIRouter(prefix="/whatsapp", tags=["whatsapp"])

# ---------------------------------------------------------------------------
# Session store — in-memory, thread-safe, 30-minute TTL
# Single-instance safe (same pattern as STAGE0_HASH_CACHE in evidence_validation.py)
# For multi-instance deployments: swap this dict for Redis.
# ---------------------------------------------------------------------------

SESSION_TTL_SECONDS = 1800  # 30 minutes

# Step constants — kept as ints for simplicity (no FSM class needed)
STEP_IDLE = 0
STEP_AWAITING_PHOTO = 1
STEP_AWAITING_LOCATION = 2
STEP_AWAITING_NOTE = 3


@dataclass
class WhatsAppSession:
    step: int = STEP_IDLE
    photo_bytes: Optional[bytes] = None
    mime_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_active: float = field(default_factory=time.time)

    def touch(self) -> None:
        self.last_active = time.time()

    def is_expired(self) -> bool:
        return (time.time() - self.last_active) > SESSION_TTL_SECONDS


_sessions: dict[str, WhatsAppSession] = {}
_sessions_lock = threading.Lock()


def _get_or_create_session(phone: str) -> WhatsAppSession:
    with _sessions_lock:
        session = _sessions.get(phone)
        if session is None or session.is_expired():
            session = WhatsAppSession()
            _sessions[phone] = session
        session.touch()
        return session


def _reset_session(phone: str) -> None:
    with _sessions_lock:
        _sessions[phone] = WhatsAppSession()


# ---------------------------------------------------------------------------
# Twilio adapter helpers — isolate all provider-specific code here
# ---------------------------------------------------------------------------

async def _download_media(media_url: str) -> tuple[bytes, str]:
    """
    Download a photo from Twilio's CDN.
    Returns (photo_bytes, mime_type).
    Raises httpx.HTTPError on failure.
    """
    auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(media_url, auth=auth)
        resp.raise_for_status()
        mime_type = resp.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        return resp.content, mime_type


def _twiml_reply(body: str) -> Response:
    """Build a Twilio MessagingResponse XML response."""
    mr = MessagingResponse()
    mr.message(body)
    return Response(content=str(mr), media_type="application/xml")


def _validate_twilio_signature(request: Request, body: bytes) -> bool:
    """
    Validate that the request genuinely comes from Twilio.
    Skips validation if TWILIO_AUTH_TOKEN is empty (useful for testing).
    """
    if not settings.TWILIO_AUTH_TOKEN:
        return True  # testing mode — no auth token configured
    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    signature = request.headers.get("X-Twilio-Signature", "")
    url = str(request.url)
    try:
        params = dict(
            pair.split("=", 1)
            for pair in body.decode().split("&")
            if "=" in pair
        )
        from urllib.parse import unquote_plus
        params = {unquote_plus(k): unquote_plus(v) for k, v in params.items()}
        return validator.validate(url, params, signature)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Message composers — one function per message type, easy to localise later
# ---------------------------------------------------------------------------

def _msg_welcome() -> str:
    return (
        "👋 Welcome to CivicPulse!\n\n"
        "Report a civic infrastructure issue in 3 quick steps:\n"
        "1️⃣  Send a clear photo of the problem\n"
        "2️⃣  Share your live location 📍\n"
        "3️⃣  Add an optional description (or reply *skip*)\n\n"
        "Ready? Send your photo now."
    )


def _msg_photo_received() -> str:
    return (
        "✅ Photo received!\n\n"
        "Now share your *live location* so we can map the issue.\n\n"
        "_Tap the 📎 attachment icon → Location → Share Live Location_"
    )


def _msg_location_received() -> str:
    return (
        "📍 Location locked!\n\n"
        "Optionally add a short description — e.g. *Large pothole near bus stop* — "
        "or reply *skip* to submit now."
    )


def _msg_processing() -> str:
    return "⏳ Processing your report through the AI pipeline. This takes a few seconds..."


def _msg_success(issue_id: str, credibility_score: Optional[float], base_url: str) -> str:
    dashboard_url = f"{base_url.rstrip('/')}/issue/{issue_id}"
    score_line = ""
    if credibility_score is not None:
        score_line = f"Trust Score: {credibility_score:.0%}\n"
    return (
        f"✅ *Case Created Successfully!*\n\n"
        f"Case ID: `{issue_id}`\n"
        f"{score_line}"
        f"\n📊 *Continue on the dashboard:*\n"
        f"{dashboard_url}\n\n"
        f"From the dashboard you can:\n"
        f"• Track your case progress\n"
        f"• Review AI-generated complaint drafts\n"
        f"• Approve escalation to government\n"
        f"• Download your RTI application as PDF"
    )


def _msg_stage0_rejection(failure: Optional[str], message: str, suggestion: str) -> str:
    failure_label = {
        "DOCUMENT": "This appears to be a document or certificate",
        "SCREENSHOT": "This appears to be a screenshot",
        "SELFIE": "This appears to be a selfie",
        "LOW_QUALITY": "The image quality is too low",
        "NO_INFRASTRUCTURE": "No civic infrastructure detected",
        "NO_VISIBLE_ISSUE": "No visible civic issue found",
        "MANUAL_REVIEW": "The image couldn't be verified confidently",
    }.get(failure or "", message)

    return (
        f"❌ *Photo not accepted*\n\n"
        f"{failure_label}.\n\n"
        f"💡 *Suggestion:* {suggestion}\n\n"
        f"*Accepted examples:*\n"
        f"• Potholes & road damage\n"
        f"• Broken streetlights\n"
        f"• Overflowing garbage\n"
        f"• Water leaks or blocked drains\n"
        f"• Damaged footpaths\n\n"
        f"Please send a new photo to try again."
    )


def _msg_ai_error() -> str:
    return (
        "⚠️ Our AI pipeline is temporarily unavailable.\n\n"
        "Please try again in a few moments. "
        "If the issue persists, use the web dashboard: "
        f"{settings.APP_BASE_URL}"
    )


def _msg_unexpected_input(step: int) -> str:
    if step == STEP_AWAITING_PHOTO:
        return "📷 Please send a *photo* of the civic issue to continue."
    if step == STEP_AWAITING_LOCATION:
        return "📍 Please *share your live location* to continue.\n\n_Tap 📎 → Location → Share Live Location_"
    return "Type *Hi* to start reporting a civic issue."


# ---------------------------------------------------------------------------
# Webhook endpoint
# ---------------------------------------------------------------------------

@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
):
    """
    Twilio WhatsApp webhook. Called for every incoming message.

    Returns TwiML XML (Twilio requirement: always HTTP 200).
    Feature-gated by WHATSAPP_ENABLED setting.
    """
    if not settings.WHATSAPP_ENABLED:
        return Response(
            content="WhatsApp channel is not enabled on this deployment.",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    # Read and validate raw body
    raw_body = await request.body()
    if not _validate_twilio_signature(request, raw_body):
        logger.warning("whatsapp_invalid_signature | possible spoofed request")
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    # Parse Twilio form fields
    form = await request.form()
    from_number: str = form.get("From", "")
    body_text: str = form.get("Body", "").strip()
    num_media: int = int(form.get("NumMedia", 0))
    media_url: Optional[str] = form.get("MediaUrl0") if num_media > 0 else None
    media_type: Optional[str] = form.get("MediaContentType0") if num_media > 0 else None
    latitude_str: Optional[str] = form.get("Latitude")
    longitude_str: Optional[str] = form.get("Longitude")

    has_image = bool(media_url and media_type and media_type.startswith("image/"))
    has_location = bool(latitude_str and longitude_str)

    logger.info(
        f"whatsapp_message | from={from_number} | "
        f"body={body_text[:40]!r} | has_image={has_image} | has_location={has_location}"
    )

    wa_session = _get_or_create_session(from_number)

    # ------------------------------------------------------------------
    # Greeting — any incoming "hi" / "hello" / new session resets state
    # ------------------------------------------------------------------
    if body_text.lower() in ("hi", "hello", "start", "help", "") and not has_image and not has_location:
        _reset_session(from_number)
        wa_session = _get_or_create_session(from_number)
        wa_session.step = STEP_AWAITING_PHOTO
        return _twiml_reply(_msg_welcome())

    # ------------------------------------------------------------------
    # Step 1: Awaiting photo
    # ------------------------------------------------------------------
    if wa_session.step == STEP_AWAITING_PHOTO:
        if not has_image:
            return _twiml_reply(_msg_unexpected_input(STEP_AWAITING_PHOTO))

        try:
            photo_bytes, resolved_mime = await _download_media(media_url)
            # Normalise MIME — Twilio sometimes sends "image/jpg"
            if resolved_mime == "image/jpg":
                resolved_mime = "image/jpeg"
            if resolved_mime not in ("image/jpeg", "image/png"):
                resolved_mime = media_type or "image/jpeg"
        except Exception as exc:
            logger.error(f"whatsapp_media_download_failed | error={str(exc)}")
            return _twiml_reply(
                "⚠️ We couldn't download your photo. Please try sending it again."
            )

        wa_session.photo_bytes = photo_bytes
        wa_session.mime_type = resolved_mime
        wa_session.step = STEP_AWAITING_LOCATION
        return _twiml_reply(_msg_photo_received())

    # ------------------------------------------------------------------
    # Step 2: Awaiting location
    # ------------------------------------------------------------------
    if wa_session.step == STEP_AWAITING_LOCATION:
        if not has_location:
            return _twiml_reply(_msg_unexpected_input(STEP_AWAITING_LOCATION))

        try:
            wa_session.latitude = float(latitude_str)
            wa_session.longitude = float(longitude_str)
        except (TypeError, ValueError):
            return _twiml_reply("📍 Couldn't read your location. Please try sharing it again.")

        wa_session.step = STEP_AWAITING_NOTE
        return _twiml_reply(_msg_location_received())

    # ------------------------------------------------------------------
    # Step 3: Awaiting optional note → submit
    # ------------------------------------------------------------------
    if wa_session.step == STEP_AWAITING_NOTE:
        user_note = None if body_text.lower() == "skip" else body_text or None

        # Guard against incomplete sessions (shouldn't happen with normal flow)
        if wa_session.photo_bytes is None or wa_session.latitude is None or wa_session.longitude is None:
            _reset_session(from_number)
            return _twiml_reply(
                "⚠️ Session data was lost. Please start again by sending *Hi*."
            )

        # Acknowledge receipt while pipeline runs
        # (TwiML is synchronous — we send one reply; the issue creation runs inline)
        try:
            db_issue = await create_issue_from_bytes(
                photo_bytes=wa_session.photo_bytes,
                mime_type=wa_session.mime_type or "image/jpeg",
                latitude=wa_session.latitude,
                longitude=wa_session.longitude,
                user_note=user_note,
                background_tasks=background_tasks,
                session=session,
            )
        except IssueValidationError as exc:
            r = exc.stage0_result
            # Reset to photo step so user can retry
            wa_session.step = STEP_AWAITING_PHOTO
            wa_session.photo_bytes = None
            wa_session.mime_type = None
            return _twiml_reply(
                _msg_stage0_rejection(
                    failure=r.failure.value if r.failure else None,
                    message=r.message,
                    suggestion=r.suggestion,
                )
            )
        except HTTPException as exc:
            logger.error(f"whatsapp_pipeline_http_error | detail={exc.detail}")
            _reset_session(from_number)
            return _twiml_reply(_msg_ai_error())
        except Exception as exc:
            logger.error(f"whatsapp_pipeline_unexpected_error | error={str(exc)}")
            _reset_session(from_number)
            return _twiml_reply(_msg_ai_error())

        # Clear session on success
        _reset_session(from_number)

        return _twiml_reply(
            _msg_success(
                issue_id=db_issue.id,
                credibility_score=db_issue.credibility_score,
                base_url=settings.APP_BASE_URL or "https://civicpulse.app",
            )
        )

    # ------------------------------------------------------------------
    # Fallback — unknown state, reset
    # ------------------------------------------------------------------
    _reset_session(from_number)
    return _twiml_reply(_msg_welcome())
