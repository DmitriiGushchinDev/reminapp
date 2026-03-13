from datetime import datetime
from database import Base
from sqlalchemy import ARRAY, JSON, DateTime, Float, Integer, String, Boolean, ForeignKey,UUID,Table,Column,Date,Enum as PgEnum, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import enum
import json

class Service(Base):
    __tablename__ = "services"
    id:Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name:Mapped[str] = mapped_column(String, nullable=False)
    duration:Mapped[int] = mapped_column(Integer, nullable=False)
    price:Mapped[float] = mapped_column(Float, nullable=False)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at:Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at:Mapped[datetime] = mapped_column(DateTime, nullable=False)

class Template(Base):
    __tablename__ = "templates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name:Mapped[str] = mapped_column(String, nullable=False)
    content:Mapped[str] = mapped_column(Text, nullable=False)
    variables:Mapped[dict] = mapped_column(JSON, nullable=False)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at:Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at:Mapped[datetime] = mapped_column(DateTime, nullable=False)


