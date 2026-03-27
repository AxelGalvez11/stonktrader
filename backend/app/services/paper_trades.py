from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.paper_trade import PaperTrade
from app.schemas.paper_trades import PaperTradeCreate, PaperTradeClose, PaperTradeRead


def _pnl(direction: str, entry: float, exit_price: float, size_usd: float) -> tuple[float, float]:
    pct = (exit_price - entry) / entry if direction == "long" else (entry - exit_price) / entry
    return round(size_usd * pct, 2), round(pct * 100, 4)


def list_trades(db: Session, status: str | None = None) -> list[PaperTradeRead]:
    q = db.query(PaperTrade)
    if status:
        q = q.filter(PaperTrade.status == status)
    rows = q.order_by(PaperTrade.created_at.desc()).all()
    return [PaperTradeRead.model_validate(r) for r in rows]


def create_trade(db: Session, payload: PaperTradeCreate) -> PaperTradeRead:
    row = PaperTrade(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return PaperTradeRead.model_validate(row)


def close_trade(db: Session, trade_id: int, payload: PaperTradeClose) -> PaperTradeRead:
    row = db.query(PaperTrade).filter(PaperTrade.id == trade_id).first()
    if not row:
        raise NotFoundError(f"Paper trade {trade_id} not found")
    if row.status != "open":
        raise ValueError(f"Trade {trade_id} is already {row.status}")

    pnl, pnl_pct = _pnl(row.direction, row.entry_price, payload.exit_price, row.size_usd)
    row.exit_price = payload.exit_price
    row.exit_at = datetime.now(timezone.utc)
    row.status = "closed"
    row.pnl = pnl
    row.pnl_pct = pnl_pct
    db.commit()
    db.refresh(row)
    return PaperTradeRead.model_validate(row)


def delete_trade(db: Session, trade_id: int) -> None:
    row = db.query(PaperTrade).filter(PaperTrade.id == trade_id).first()
    if not row:
        raise NotFoundError(f"Paper trade {trade_id} not found")
    db.delete(row)
    db.commit()
