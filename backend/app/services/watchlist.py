from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.watchlist import WatchlistItem
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemRead


def _to_read(item: WatchlistItem) -> WatchlistItemRead:
    tags = [t.strip() for t in (item.tags or "").split(",") if t.strip()]
    return WatchlistItemRead(
        id=item.id,
        symbol=item.symbol,
        asset_type=item.asset_type,
        notes=item.notes or "",
        tags=tags,
        added_at=item.added_at,
        last_score=item.last_score,
        last_updated=item.last_updated,
    )


def list_watchlist(db: Session) -> list[WatchlistItemRead]:
    rows = db.query(WatchlistItem).order_by(WatchlistItem.added_at.desc()).all()
    return [_to_read(r) for r in rows]


def add_item(db: Session, payload: WatchlistItemCreate) -> WatchlistItemRead:
    # Upsert: if symbol+asset_type already exists just return it
    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.symbol == payload.symbol, WatchlistItem.asset_type == payload.asset_type)
        .first()
    )
    if existing:
        existing.notes = payload.notes
        existing.tags = ",".join(payload.tags)
        existing.last_updated = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return _to_read(existing)

    row = WatchlistItem(
        symbol=payload.symbol,
        asset_type=payload.asset_type,
        notes=payload.notes,
        tags=",".join(payload.tags),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_read(row)


def remove_item(db: Session, item_id: int) -> None:
    row = db.query(WatchlistItem).filter(WatchlistItem.id == item_id).first()
    if not row:
        raise NotFoundError(f"Watchlist item {item_id} not found")
    db.delete(row)
    db.commit()
