from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import app_settings as svc

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings(db: Session = Depends(get_db)) -> dict:
    return svc.get_settings(db)


@router.put("")
def update_settings(updates: dict, db: Session = Depends(get_db)) -> dict:
    return svc.update_settings(db, updates)
