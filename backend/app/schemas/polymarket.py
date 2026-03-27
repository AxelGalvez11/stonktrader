from pydantic import BaseModel


class PolymarketSignal(BaseModel):
    id: str
    title: str
    question: str
    category: str
    tags: list[str]
    probability: float
    probability_change_24h: float
    volume_24h: float
    status: str
    linked_theme: str
    related_assets: list[str]
    notes: str
    close_time: str | None = None
