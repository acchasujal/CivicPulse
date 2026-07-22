"""
test_whatsapp_webhook.py

Tests for the WhatsApp webhook conversation flow.
Covers: greeting, photo step, location step, note/submit step,
Stage-0 rejection, feature flag disabled behaviour, and session management.

All Twilio calls are mocked. The issue_service pipeline is patched at the
create_issue_from_bytes level.
"""

import os
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app

# ---------------------------------------------------------------------------
# Helper: build a minimal Twilio-style form POST body
# ---------------------------------------------------------------------------

def _twilio_form(
    from_number: str = "whatsapp:+919876543210",
    body: str = "",
    num_media: int = 0,
    media_url: str = "",
    media_content_type: str = "",
    latitude: str = "",
    longitude: str = "",
) -> dict:
    data = {
        "From": from_number,
        "Body": body,
        "NumMedia": str(num_media),
    }
    if num_media > 0:
        data["MediaUrl0"] = media_url
        data["MediaContentType0"] = media_content_type
    if latitude:
        data["Latitude"] = latitude
        data["Longitude"] = longitude
    return data


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def enable_whatsapp(monkeypatch):
    """Enable WhatsApp feature flag for all tests in this module."""
    monkeypatch.setattr("app.routers.whatsapp.settings.WHATSAPP_ENABLED", True)
    monkeypatch.setattr("app.routers.whatsapp.settings.TWILIO_AUTH_TOKEN", "")  # skip sig validation


@pytest.fixture(autouse=True)
def reset_sessions():
    """Clear in-memory session store before each test."""
    from app.routers.whatsapp import _sessions
    _sessions.clear()
    yield
    _sessions.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def post_webhook(client, **kwargs) -> str:
    """POST to the webhook and return the TwiML response body text."""
    resp = client.post(
        "/api/whatsapp/webhook",
        data=_twilio_form(**kwargs),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, f"Expected 200 got {resp.status_code}: {resp.text}"
    return resp.text


# ---------------------------------------------------------------------------
# Tests: Feature flag
# ---------------------------------------------------------------------------

def test_whatsapp_disabled_returns_503(monkeypatch):
    monkeypatch.setattr("app.routers.whatsapp.settings.WHATSAPP_ENABLED", False)
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.post(
        "/api/whatsapp/webhook",
        data=_twilio_form(body="Hi"),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 503


# ---------------------------------------------------------------------------
# Tests: Conversation flow
# ---------------------------------------------------------------------------

def test_greeting_resets_session_and_sends_welcome(client):
    twiml = post_webhook(client, body="Hi")
    assert "nivaran" in twiml
    assert "photo" in twiml.lower()


def test_hello_also_triggers_welcome(client):
    twiml = post_webhook(client, body="hello")
    assert "nivaran" in twiml


def test_unexpected_text_before_greeting_sends_welcome(client):
    twiml = post_webhook(client, body="what is this")
    assert "nivaran" in twiml


@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
def test_photo_step_advances_session(mock_download, client):
    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    # Step 0 — greeting
    post_webhook(client, body="Hi")

    # Step 1 — send photo
    twiml = post_webhook(
        client,
        num_media=1,
        media_url="https://twilio.com/media/test.jpg",
        media_content_type="image/jpeg",
    )
    assert "location" in twiml.lower()
    mock_download.assert_awaited_once()


@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
def test_non_image_in_photo_step_shows_error(mock_download, client):
    post_webhook(client, body="Hi")

    # Send text instead of photo
    twiml = post_webhook(client, body="here is some text")
    assert "photo" in twiml.lower()
    mock_download.assert_not_called()


@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
def test_location_step_advances_session(mock_download, client):
    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    post_webhook(client, body="Hi")
    post_webhook(client, num_media=1, media_url="https://twilio.com/media/test.jpg", media_content_type="image/jpeg")

    # Step 2 — share location
    twiml = post_webhook(client, latitude="19.0760", longitude="72.8777")
    assert "description" in twiml.lower() or "skip" in twiml.lower()


@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
@patch("app.routers.whatsapp.create_issue_from_bytes", new_callable=AsyncMock)
def test_full_flow_returns_case_id(mock_create, mock_download, client):
    """Full happy path: greeting → photo → location → skip → case created."""
    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    # Fake a returned Issue with the fields WhatsApp reads
    fake_issue = MagicMock()
    fake_issue.id = "test-case-abc"
    fake_issue.credibility_score = 0.87
    mock_create.return_value = fake_issue

    post_webhook(client, body="Hi")
    post_webhook(client, num_media=1, media_url="https://twilio.com/media/test.jpg", media_content_type="image/jpeg")
    post_webhook(client, latitude="19.0760", longitude="72.8777")

    twiml = post_webhook(client, body="skip")

    assert "test-case-abc" in twiml
    assert "87%" in twiml or "0.87" in twiml or "87" in twiml
    mock_create.assert_awaited_once()


@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
@patch("app.routers.whatsapp.create_issue_from_bytes", new_callable=AsyncMock)
def test_full_flow_with_note(mock_create, mock_download, client):
    """Full happy path with user note."""
    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    fake_issue = MagicMock()
    fake_issue.id = "note-case-xyz"
    fake_issue.credibility_score = 0.92
    mock_create.return_value = fake_issue

    post_webhook(client, body="Hi")
    post_webhook(client, num_media=1, media_url="https://twilio.com/media/test.jpg", media_content_type="image/jpeg")
    post_webhook(client, latitude="19.0760", longitude="72.8777")

    twiml = post_webhook(client, body="Large pothole near bus stop")

    assert "note-case-xyz" in twiml
    # Verify the user note was passed
    call_kwargs = mock_create.call_args.kwargs
    assert call_kwargs["user_note"] == "Large pothole near bus stop"


# ---------------------------------------------------------------------------
# Tests: Stage-0 rejection
# ---------------------------------------------------------------------------

@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
@patch("app.routers.whatsapp.create_issue_from_bytes", new_callable=AsyncMock)
def test_stage0_rejection_sends_helpful_message(mock_create, mock_download, client):
    """Stage-0 rejection should send a human-readable message and allow retry."""
    from app.services.issue_service import IssueValidationError
    from app.services.evidence_validation import Stage0Result, Stage0Checks, ValidationFailure

    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    rejection_result = Stage0Result(
        accepted=False,
        failure=ValidationFailure.SCREENSHOT,
        confidence=0.97,
        detected_object="Screenshot",
        checks=Stage0Checks(file=True, quality=True, scene=False, infrastructure=False, issue=False),
        message="Screenshot detected.",
        suggestion="Please upload a clear outdoor photograph of the actual civic issue.",
    )
    mock_create.side_effect = IssueValidationError(rejection_result)

    post_webhook(client, body="Hi")
    post_webhook(client, num_media=1, media_url="https://twilio.com/media/test.jpg", media_content_type="image/jpeg")
    post_webhook(client, latitude="19.0760", longitude="72.8777")
    twiml = post_webhook(client, body="skip")

    # Should explain the rejection
    assert "screenshot" in twiml.lower() or "accepted" in twiml.lower() or "photo" in twiml.lower()
    # Should allow retry — session reset to step 1
    from app.routers.whatsapp import _sessions
    sess = _sessions.get("whatsapp:+919876543210")
    assert sess is not None
    from app.routers.whatsapp import STEP_AWAITING_PHOTO
    assert sess.step == STEP_AWAITING_PHOTO


# ---------------------------------------------------------------------------
# Tests: Session isolation
# ---------------------------------------------------------------------------

@patch("app.routers.whatsapp._download_media", new_callable=AsyncMock)
def test_different_phone_numbers_have_isolated_sessions(mock_download, client):
    mock_download.return_value = (b"FAKEJPEG", "image/jpeg")

    # User A starts, sends photo
    post_webhook(client, from_number="whatsapp:+911111111111", body="Hi")
    post_webhook(
        client,
        from_number="whatsapp:+911111111111",
        num_media=1,
        media_url="https://twilio.com/media/test.jpg",
        media_content_type="image/jpeg",
    )

    # User B starts fresh
    twiml_b = post_webhook(client, from_number="whatsapp:+922222222222", body="Hi")
    assert "nivaran" in twiml_b

    from app.routers.whatsapp import _sessions, STEP_AWAITING_LOCATION, STEP_AWAITING_PHOTO
    assert _sessions["whatsapp:+911111111111"].step == STEP_AWAITING_LOCATION
    assert _sessions["whatsapp:+922222222222"].step == STEP_AWAITING_PHOTO
