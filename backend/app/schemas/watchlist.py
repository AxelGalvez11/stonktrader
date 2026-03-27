from datetime import datetime
from pydantic import BaseModel, field_validator


class WatchlistItemCreate(BaseModel):
    symbol: str
    asset_type: str
    notes: str = ""
    tags: list[str] = []

    @field_validator("symbol")
    @classmethod
    def upper_symbol(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator("asset_type")
    @classmethod
    def valid_asset_type(cls, v: str) -> str:
        allowed = {"stock", "memecoin"}
        if v not in allowed:
            raise ValueError(f"asset_type must be one of {allowed}")
        return v


class WatchlistItemRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    symbol: str
    asset_type: str
    notes: str
    tags: list[str]
    added_at: datetime
    last_score: float | None
    last_updated: datetime | None

    @field_validator("tags", mode="before")
    @classmethod
    def split_tags(cls, v):
        """DB stores tags as comma-separated string."""
        if isinstance(v, str):
            return [t.strip() for t in v.split(",") if t.strip()]
        return v or []
