from datetime import datetime
from pydantic import BaseModel


class IntegrationUpdate(BaseModel):
    enabled: bool | None = None
    api_key: str | None = None   # plaintext input — stored masked
    config: dict[str, str] = {}


class IntegrationRead(BaseModel):
    model_config = {"from_attributes": True}

    name: str
    display_name: str
    description: str
    enabled: bool
    api_key_masked: str | None
    status: str
    config: dict[str, str] = {}
    last_tested_at: datetime | None
    error_message: str | None


class IntegrationTestResult(BaseModel):
    success: bool
    message: str
    latency_ms: float | None = None
