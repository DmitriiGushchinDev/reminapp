from pydantic import BaseModel
from datetime import datetime
import uuid
from typing import Optional


class ClientResponse(BaseModel):
    id: uuid.UUID
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ClientCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None