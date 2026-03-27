from fastapi import APIRouter

from app.schemas.diagnostics import DiagnosticsResult
from app.services.diagnostics import get_stock_diagnostics, get_memecoin_diagnostics

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"])


@router.get("/stocks", response_model=DiagnosticsResult)
def stock_diagnostics():
    return get_stock_diagnostics()


@router.get("/memecoins", response_model=DiagnosticsResult)
def memecoin_diagnostics():
    return get_memecoin_diagnostics()
