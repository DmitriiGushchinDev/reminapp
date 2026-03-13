from datetime import datetime
from database import Base
from sqlalchemy import ARRAY, DateTime, Float, Integer, String, Boolean, ForeignKey,UUID,Table,Column,Date,Enum as PgEnum, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid


class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone_number: Mapped[str] = mapped_column(String, nullable=True)
    is_provider: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    email: Mapped[str] = mapped_column(String, nullable = False, unique = True)
    telegram_id: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_subscribed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    subscription_start_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    subscription_end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    subscription_type: Mapped[str] = mapped_column(String, nullable=True)
    subscription_status: Mapped[str] = mapped_column(String, nullable=True)
    subscription_id: Mapped[str] = mapped_column(String, nullable=True)
    subscription_plan: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    business_name: Mapped[str] = mapped_column(String, nullable=True)

class ProviderAndClient(Base):
    __tablename__ = "provider_and_clients"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)