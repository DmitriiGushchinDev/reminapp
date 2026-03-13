import logging
from fastapi import APIRouter, Request
from src.auth.models.auth_model import User
from src.auth.services.AuthService import authenticate_and_get_user_details
from src.appointment.services.AppointmentServices import AppointmentServices, get_current_user_and_sync
from src.appointment.models.appointment_models import Appointment
from src.appointment.schemas.Appointment_Schemas import AppointmentCreate, AppointmentUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from database import get_async_session
import uuid

logger = logging.getLogger(__name__)

router = APIRouter()
appointment_service = AppointmentServices()

@router.get("/appointments")
async def get_appointments(request: Request, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.get_appointments(session, request)

@router.post("/appointments")
async def create_appointment(request: Request, appointment: AppointmentCreate, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.create_appointment(appointment, session, request)

@router.put("/appointments/{id}")
async def put_appointment(id: uuid.UUID, appointment: AppointmentUpdate, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.put_appointment(id, appointment, session)

@router.delete("/appointments/{id}")
async def delete_appointment(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.delete_appointment(id, session)

@router.post('/appointments/{id}/send-reminder')
async def send_reminder(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.send_appointment_reminder(id, session)

@router.post('/appointments/{id}/send-cancellation-notice')
async def send_cancellation_notice(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.send_cancellation_notice(id, session)

@router.post('/appointments/{id}/cancel')
async def cancel_appointment(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.cancel_appointment(id, session)
@router.post('/appointments/add-user-businessname')
async def change_business_name( request: Request, business_name: str, session: AsyncSession = Depends(get_async_session)):
    return await appointment_service.add_business_name(request, business_name, session)