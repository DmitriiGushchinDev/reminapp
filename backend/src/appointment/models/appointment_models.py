from datetime import datetime
from database import Base
from sqlalchemy import ARRAY, DateTime, Float, Integer, String, Boolean, ForeignKey,UUID,Table,Column,Date,Enum as PgEnum, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from src.client.models.client_model import Client
from enum import Enum

class ReminderMethod(Enum):
    __tablename__ = "reminder_method_enum"
    whatsapp = "whatsapp"
    telegram = "telegram"
    sms = "sms"
    email = "email"

class Status(Enum):

    not_sent = "not-sent"
    scheduled = "scheduled"
    sent = "sent"
    failed = "failed"
    canceled = "canceled"


class Appointment(Base):
    __tablename__ = "appointments"
    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    date: Mapped[datetime] = mapped_column(Date, nullable=False)
    start_time: Mapped[datetime] = mapped_column(Time, nullable=True)
    provider_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("users.id",ondelete="CASCADE"), nullable=False)
    end_time: Mapped[datetime] = mapped_column(Time, nullable=True)
    client_name: Mapped[str] = mapped_column(String, nullable=False)
    client_phone: Mapped[str] = mapped_column(String, nullable=False)
    service: Mapped[str] = mapped_column(String, nullable=False)
    reminder_method: Mapped[ReminderMethod] = mapped_column(PgEnum(ReminderMethod, name="reminder_method_enum"), nullable=False)
    template: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[Status] = mapped_column(PgEnum(Status, name="status_enum"), nullable=False)
    cancellation_notice_sent: Mapped[bool] = mapped_column(Boolean, nullable=True,default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
