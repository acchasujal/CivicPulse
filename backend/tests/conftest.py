import pytest
import os
from app.main import app
from app.dependencies import get_evidence_validator
from app.services.evidence_validation import Stage0Result, Stage0Checks

async def override_validate_evidence_photo(photo_bytes: bytes, mime_type: str):
    if os.environ.get("TEST_STAGE0_INVALID") == "1":
        return Stage0Result(
            accepted=False,
            failure="DOCUMENT",
            confidence=0.99,
            detected_object="Document",
            checks=Stage0Checks(file=True, quality=True, scene=False, infrastructure=False, issue=False),
            message="Unsupported submission: Document detected.",
            suggestion="Please upload a real photograph showing a local civic infrastructure issue instead of a document or certificate."
        )
    return Stage0Result(
        accepted=True,
        failure=None,
        confidence=1.0,
        detected_object="Pothole",
        checks=Stage0Checks(file=True, quality=True, scene=True, infrastructure=True, issue=True),
        message="Valid photo",
        suggestion="Valid"
    )

@pytest.fixture(autouse=True)
def global_validator_override():
    app.dependency_overrides[get_evidence_validator] = lambda: override_validate_evidence_photo
    yield
    # Keep it clean across test runs
    app.dependency_overrides[get_evidence_validator] = lambda: override_validate_evidence_photo
