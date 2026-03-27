from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.integrations import IntegrationRead, IntegrationUpdate, IntegrationTestResult
from app.services import integrations as svc

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("", response_model=list[IntegrationRead])
def list_integrations(db: Session = Depends(get_db)):
    return svc.list_integrations(db)


@router.put("/{name}", response_model=IntegrationRead)
def update_integration(name: str, payload: IntegrationUpdate, db: Session = Depends(get_db)):
    return svc.update_integration(db, name, payload)


@router.post("/{name}/test", response_model=IntegrationTestResult)
def test_integration(name: str, db: Session = Depends(get_db)):
    return svc.test_integration(db, name)
