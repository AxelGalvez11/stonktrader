from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func

from app.models.base import Base


class PaperTrade(Base):
    __tablename__ = "paper_trades"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False)
    asset_type = Column(String(20), nullable=False)
    direction = Column(String(10), nullable=False)  # long | short
    entry_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    size_usd = Column(Float, nullable=False, default=1000.0)
    thesis = Column(Text, default="")
    status = Column(String(20), nullable=False, default="open")
    exit_price = Column(Float, nullable=True)
    exit_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    pnl = Column(Float, nullable=True)
    pnl_pct = Column(Float, nullable=True)
