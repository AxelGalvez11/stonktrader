from datetime import datetime, timezone
from typing import Generic, TypeVar
from pydantic import BaseModel

from app.config import settings

T = TypeVar("T")


class ApiMeta(BaseModel):
    as_of: str
    demo_mode: bool
    provider: str
    data_freshness: str
    warnings: list[str] = []


class RankedResponse(BaseModel, Generic[T]):
    meta: ApiMeta
    data: list[T]
    total: int


def make_meta(
    provider: str = "demo",
    data_freshness: str = "static",
    warnings: list[str] | None = None,
) -> ApiMeta:
    return ApiMeta(
        as_of=datetime.now(timezone.utc).isoformat(),
        demo_mode=settings.demo_mode,
        provider=provider,
        data_freshness=data_freshness,
        warnings=warnings or [],
    )
