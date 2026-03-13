from pydantic import BaseModel, field_validator
from datetime import datetime, time, date as date_type
from typing import Optional
import uuid

class AppointmentCreate(BaseModel):
    date: str  # Accept string in "YYYY-MM-DD" format from frontend
    startTime: str  # Accept string in "HH:mm" format
    endTime: Optional[str] = None  # Optional - calculated from service duration
    clientName: str
    clientPhone: str
    service: str
    reminderMethod: str
    template: str  # Template ID as string (UUID)
    status: str = "not-sent"

    @field_validator('date')
    @classmethod
    def parse_date(cls, v: str) -> str:
        # Validate date format
        datetime.strptime(v, '%Y-%m-%d')
        return v

    @field_validator('startTime')
    @classmethod
    def parse_time(cls, v: str) -> str:
        # Validate time format
        datetime.strptime(v, '%H:%M')
        return v
    
    @field_validator('endTime')
    @classmethod
    def parse_end_time(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            datetime.strptime(v, '%H:%M')
        return v

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    clientName: Optional[str] = None
    clientPhone: Optional[str] = None
    service: Optional[str] = None
    reminderMethod: Optional[str] = None
    template: Optional[str] = None
    status: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: uuid.UUID
    date: datetime
    startTime: time
    endTime: Optional[time] = None
    clientName: str
    clientPhone: str
    service: str
    reminderMethod: str
    template: str
    status: str = "scheduled"
    cancellationNoticeSent: bool
    createdAt: datetime
    updatedAt: datetime
