from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator


class PaperTradeCreate(BaseModel):
    symbol: str
    asset_type: str
    direction: str  # long | short
    entry_price: float
    stop_loss: float | None = None
    take_profit: float | None = None
    size_usd: float = 1000.0
    thesis: str = ""

    @field_validator("symbol")
    @classmethod
    def upper_symbol(cls, v: str) -> str:
        return v.upper().strip()

    @field_validator("direction")
    @classmethod
    def valid_direction(cls, v: str) -> str:
        if v not in {"long", "short"}:
            raise ValueError("direction must be 'long' or 'short'")
        return v

    @model_validator(mode="after")
    def check_prices(self) -> "PaperTradeCreate":
        if self.stop_loss and self.stop_loss <= 0:
            raise ValueError("stop_loss must be positive")
        if self.take_profit and self.take_profit <= 0:
            raise ValueError("take_profit must be positive")
        return self


class PaperTradeClose(BaseModel):
    exit_price: float

    @field_validator("exit_price")
    @classmethod
    def positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("exit_price must be positive")
        return v


class PaperTradeRead(BaseModel):
    model_config = {"from_attributes": True}

    id: int
    symbol: str
    asset_type: str
    direction: str
    entry_price: float
    stop_loss: float | None
    take_profit: float | None
    size_usd: float
    thesis: str
    status: str
    exit_price: float | None
    exit_at: datetime | None
    created_at: datetime
    pnl: float | None
    pnl_pct: float | None
