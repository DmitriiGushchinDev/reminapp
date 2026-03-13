from pydantic import BaseModel
from datetime import datetime
import uuid
from typing import Optional, List

class Service(BaseModel):
    id: uuid.UUID
    name: str
    duration: int  # minutes
    price: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ServiceCreate(BaseModel):
    name: str
    duration: int
    price: Optional[float] = None
    provider_id: Optional[uuid.UUID] = None
class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None

class Template(BaseModel):
    id: int
    name: str
    content: str
    variables: List[str]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class TemplateCreate(BaseModel):
    name: str
    content: str
    variables: List[str]
    provider_id: Optional[uuid.UUID] = None
class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[List[str]] = None