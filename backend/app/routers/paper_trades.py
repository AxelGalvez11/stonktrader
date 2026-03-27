from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.paper_trades import PaperTradeCreate, PaperTradeClose, PaperTradeRead
from app.services import paper_trades as svc

router = APIRouter(prefix="/paper-trades", tags=["paper-trades"])


@router.get("", response_model=list[PaperTradeRead])
def list_trades(status: str | None = Query(None), db: Session = Depends(get_db)):
    return svc.list_trades(db, status=status)


@router.post("", response_model=PaperTradeRead, status_code=201)
def create_trade(payload: PaperTradeCreate, db: Session = Depends(get_db)):
    return svc.create_trade(db, payload)


@router.put("/{trade_id}/close", response_model=PaperTradeRead)
def close_trade(trade_id: int, payload: PaperTradeClose, db: Session = Depends(get_db)):
    try:
        return svc.close_trade(db, trade_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{trade_id}", status_code=204)
def delete_trade(trade_id: int, db: Session = Depends(get_db)):
    svc.delete_trade(db, trade_id)
