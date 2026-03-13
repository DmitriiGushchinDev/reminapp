from datetime import datetime
from database import Base
from sqlalchemy import ARRAY, DateTime, Float, Integer, String, Boolean, ForeignKey,UUID,Table,Column,Date,Enum as PgEnum, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
import enum

class Client(Base):
    __tablename__ = "clients"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, nullable=False, unique=False)
    email: Mapped[str] = mapped_column(String, nullable=True)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)