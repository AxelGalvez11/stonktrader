from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.watchlist import WatchlistItemCreate, WatchlistItemRead
from app.services import watchlist as svc

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=list[WatchlistItemRead])
def list_items(db: Session = Depends(get_db)):
    return svc.list_watchlist(db)


@router.post("", response_model=WatchlistItemRead, status_code=201)
def add_item(payload: WatchlistItemCreate, db: Session = Depends(get_db)):
    return svc.add_item(db, payload)


@router.delete("/{item_id}", status_code=204)
def remove_item(item_id: int, db: Session = Depends(get_db)):
    svc.remove_item(db, item_id)
