from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
import uuid

class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(..., unique=True)
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    phone_number: Optional[str] = None
    telegram_id: Optional[str] = None
    business_name: Optional[str] = Field(None, max_length=80)

class UserResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    telegram_id: Optional[str] = None
    business_name: Optional[str] = None
    is_provider: bool
    is_active: bool
    is_subscribed: bool
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    subscription_type: Optional[str] = None
    subscription_status: Optional[str] = None
    subscription_id: Optional[str] = None
    subscription_plan: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_active: bool