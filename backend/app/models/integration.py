from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func

from app.models.base import Base


class IntegrationModel(Base):
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    enabled = Column(Boolean, default=False)
    api_key_masked = Column(Text, nullable=True)   # stored masked; never returns raw key
    config_json = Column(Text, default="{}")        # JSON string for extra params
    status = Column(String(20), default="unconfigured")
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
