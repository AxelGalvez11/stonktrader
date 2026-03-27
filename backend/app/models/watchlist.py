from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func

from app.models.base import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    asset_type = Column(String(20), nullable=False)  # stock | memecoin
    notes = Column(Text, default="")
    tags = Column(String(500), default="")  # comma-separated (SQLite-compat)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    last_score = Column(Float, nullable=True)
    last_updated = Column(DateTime(timezone=True), nullable=True)
