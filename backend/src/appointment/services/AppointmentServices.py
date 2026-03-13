from fastapi import HTTPException
from datetime import datetime, time as time_type
import uuid
import os
from fastapi import Request
from sqlalchemy import select
from src.auth.models.auth_model import User
from src.appointment.models.appointment_models import Appointment
from src.appointment.schemas.Appointment_Schemas import AppointmentCreate, AppointmentResponse, AppointmentUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from src.provider.models.provider_models import Template
from config import settings
import jwt
from jwt import PyJWKClient
import httpx
from fastapi import HTTPException, Request
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from src.client.models.client_model import Client
from src.sms_sender.sms_sender import send_sms
from src.appointment.models.appointment_models import ReminderMethod, Status


def parse_date_string(date_str: str) -> datetime:
    """Parse date string in YYYY-MM-DD format to datetime."""
    return datetime.strptime(date_str, '%Y-%m-%d')


def parse_time_string(time_str: str) -> time_type:
    """Parse time string in HH:MM format to time object."""
    return datetime.strptime(time_str, '%H:%M').time()


def get_status_enum(status_str: str) -> Status:
    """Convert status string to Status enum."""
    status_map = {
        'not-sent': Status.not_sent,
        'not_sent': Status.not_sent,
        'scheduled': Status.scheduled,
        'sent': Status.sent,
        'failed': Status.failed,
        'canceled': Status.canceled
    }
    return status_map.get(status_str, Status.not_sent)


def get_reminder_method_enum(method_str: str) -> ReminderMethod:
    """Convert reminder method string to ReminderMethod enum."""
    method_map = {
        'whatsapp': ReminderMethod.whatsapp,
        'telegram': ReminderMethod.telegram,
        'sms': ReminderMethod.sms,
        'email': ReminderMethod.email
    }
    return method_map.get(method_str, ReminderMethod.email)




# Initialize Clerk with the backend secret key (prefer CLERK_SECRET_KEY env var)
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY") or settings.SECRET_KEY)

JWT_ISSUER = os.getenv("JWT_ISSUER")
# Config uses env name "JWKS" (see config.py). Try settings first, then fallback to env.
JWKS_URL = getattr(settings, "JWKS_URL", None) or os.getenv("JWKS") or os.getenv("JWKS_URL")
if not JWKS_URL:
    raise RuntimeError("JWKS URL is not configured. Set the JWKS environment variable (name: JWKS).")

_jwk_client = PyJWKClient(JWKS_URL)


async def get_current_user_and_sync(request: Request):
    # Let Clerk verify Authorization header for you
    http_req = httpx.Request("GET", "http://local", headers=request.headers)
    state = clerk.authenticate_request(http_req, AuthenticateRequestOptions())
    if not state.is_signed_in:
        print(state.reason)
        raise HTTPException(status_code=401, detail=f"Unauthorized: {state.reason}")
    user_id = state.payload.get("sub")
    print(user_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="No user id in token")
    # Fetch full profile server-to-server
    user = clerk.users.get(user_id=user_id)
    # Extract fields (align with your DB)
    first_name = user.first_name
    last_name  = user.last_name
    image_url  = user.image_url
    primary_email = None
    if user.primary_email_address_id and user.email_addresses:
        for e in user.email_addresses:
            if e.id == user.primary_email_address_id:
                primary_email = e.email_address
                break
    # Return something your endpoints can use
    return {"clerk_id": user_id, "email": primary_email, "first_name": first_name, "last_name": last_name, "image_url": image_url}


class AppointmentServices:
    async def create_appointment(self, appointment: AppointmentCreate, session: AsyncSession, request: Request):
        print('Hello')
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        
        # Get template content if template ID provided
        template_content = ""
        if appointment.template:
            try:
                template_uuid = uuid.UUID(appointment.template)
                template = await session.execute(select(Template).where(Template.id == template_uuid))
                template = template.scalar_one_or_none()
                if template:
                    template_content = template.content
                else:
                    template_content = appointment.template  # Use template ID as fallback
            except ValueError:
                # Not a valid UUID, use as content directly
                template_content = appointment.template
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Parse date and time strings
        parsed_date = parse_date_string(appointment.date)
        parsed_start_time = parse_time_string(appointment.startTime)
        parsed_end_time = parse_time_string(appointment.endTime)
        
        # Get enums
        reminder_method_enum = get_reminder_method_enum(appointment.reminderMethod)
        status_enum = get_status_enum(appointment.status)
        
        new_appointment = Appointment(
            id=uuid.uuid4(),
            date=parsed_date,
            start_time=parsed_start_time,
            end_time=parsed_end_time,
            client_name=appointment.clientName,
            client_phone=appointment.clientPhone,
            service=appointment.service,
            reminder_method=reminder_method_enum,
            template=template_content,
            status=status_enum,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            provider_id=user.id
        )
        session.add(new_appointment)
        await session.commit()
        await session.refresh(new_appointment)
        client_phone = new_appointment.client_phone
        client = await session.execute(select(Client).where(Client.phone == client_phone,Client.provider_id==user.id))
        client = client.scalar_one_or_none()
        if not client:
            client = Client(
                id=uuid.uuid4(),
                phone=client_phone,
                name=new_appointment.client_name,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                provider_id=user.id
            )
            session.add(client)
            await session.commit()
            await session.refresh(client)
        return AppointmentResponse(
            id=new_appointment.id,
            date=new_appointment.date,
            startTime=new_appointment.start_time,
            endTime=new_appointment.end_time,
            clientName=new_appointment.client_name,
            clientPhone=new_appointment.client_phone,
            service=new_appointment.service,
            reminderMethod=new_appointment.reminder_method.value,
            template=new_appointment.template,
            status=new_appointment.status.value,
            cancellationNoticeSent=new_appointment.cancellation_notice_sent or False,
            createdAt=new_appointment.created_at,
            updatedAt=new_appointment.updated_at
        )
    
    async def get_appointments(self, session: AsyncSession, request: Request):
        print('hello')
        appointments = await session.execute(select(Appointment))
        appointments = appointments.scalars().all()
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email=user_info['email'],
                name=f"{user_info['first_name']} {user_info['last_name']}",
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        appointments = await session.execute(select(Appointment).where(Appointment.provider_id == user.id))
        appointments = appointments.scalars().all()
        return [AppointmentResponse(
            id=appointment.id,
            date=appointment.date,
            startTime=appointment.start_time,
            endTime=appointment.end_time,
            clientName=appointment.client_name,
            clientPhone=appointment.client_phone,
            service=appointment.service,
            reminderMethod=appointment.reminder_method.value,
            template=appointment.template,
            status=appointment.status.value,
            cancellationNoticeSent=appointment.cancellation_notice_sent or False,
            createdAt=appointment.created_at,
            updatedAt=appointment.updated_at
        ) for appointment in appointments]

    async def put_appointment(self, appointment_id: uuid.UUID, appointment_updates: AppointmentUpdate, session: AsyncSession):
        appointment = await session.get(Appointment, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Handle template lookup if provided
        if appointment_updates.template:
            try:
                template_uuid = uuid.UUID(appointment_updates.template)
                template = await session.execute(select(Template).where(Template.id == template_uuid))
                template = template.scalar_one_or_none()
                if template:
                    appointment.template = template.content
                else:
                    appointment.template = appointment_updates.template  # Fallback to ID/content
            except ValueError:
                # Not a valid UUID, use as content directly
                appointment.template = appointment_updates.template
        
        if appointment_updates.date:
            appointment.date = parse_date_string(appointment_updates.date)
        if appointment_updates.startTime:
            appointment.start_time = parse_time_string(appointment_updates.startTime)
        if appointment_updates.endTime:
            appointment.end_time = parse_time_string(appointment_updates.endTime)
        if appointment_updates.clientName:
            appointment.client_name = appointment_updates.clientName
        if appointment_updates.clientPhone:
            appointment.client_phone = appointment_updates.clientPhone
        if appointment_updates.service:
            appointment.service = appointment_updates.service
        if appointment_updates.reminderMethod:
            appointment.reminder_method = get_reminder_method_enum(appointment_updates.reminderMethod)
        if appointment_updates.status:
            appointment.status = get_status_enum(appointment_updates.status)
        
        appointment.updated_at = datetime.now()
        await session.commit()
        await session.refresh(appointment)
        return AppointmentResponse(
            id=appointment.id,
            date=appointment.date,
            startTime=appointment.start_time,
            endTime=appointment.end_time,
            clientName=appointment.client_name,
            clientPhone=appointment.client_phone,
            service=appointment.service,
            reminderMethod=appointment.reminder_method.value,
            template=appointment.template,
            status=appointment.status.value,
            cancellationNoticeSent=appointment.cancellation_notice_sent or False,
            createdAt=appointment.created_at,
            updatedAt=appointment.updated_at
        )
    
    async def delete_appointment(self, appointment_id: uuid.UUID, session: AsyncSession):
        print('hello')
        appointment = await session.get(Appointment, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        await session.delete(appointment)
        await session.commit()
        return appointment
    
    async def send_appointment_reminder(self, appointment_id: uuid.UUID, session: AsyncSession):
        print('ehello')
        appointment = await session.get(Appointment, appointment_id)
        print('here', appointment.reminder_method)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.reminder_method == ReminderMethod.email:
            await send_email(appointment.client_email, appointment.client_name, appointment.service)
        elif appointment.reminder_method == ReminderMethod.sms:
            print("here")
            print(appointment.template)
            send_sms(appointment.client_phone, appointment.template)
        # elif appointment.reminder_method == ReminderMethod.whatsapp:
        #     await send_whatsapp(appointment.client_phone, appointment.client_name, appointment.service)
        # elif appointment.reminder_method == ReminderMethod.telegram:
        #     await send_telegram(appointment.client_phone, appointment.client_name, appointment.service)
        # await session.commit()
        # await session.refresh(appointment)
        return {'success': True, "message": "Appointment reminder sent"}
    
    async def add_business_name(self, request: Request,business_name:str,session: AsyncSession):
        user_info = get_current_user_and_sync(request)
        result = await session.execute(select(User).where(User.email == user_info['email']))
        user = result.scalar_one_or_none()
        if user is None:
            return ValueError(f"User with email {user_info['email']} not found")
        user.business_name = business_name

        await session.commit()
        await session.refresh(user)


    async def send_whatsapp(self, client_phone: str, client_name: str, service: str):
        pass
    
    async def send_telegram(self, client_phone: str, client_name: str, service: str):
        pass

    async def cancel_appointment(self, appointment_id: uuid.UUID, session: AsyncSession):
        appointment = await session.get(Appointment, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        appointment.status = "canceled"
        await session.commit()
        await session.refresh(appointment)
        return appointment
    
    async def send_cancellation_notice(self, appointment_id: uuid.UUID, session: AsyncSession):
        appointment = await session.get(Appointment, appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        if appointment.reminder_method == ReminderMethod.email:
            await send_email(appointment.client_email, appointment.client_name, appointment.service)
        elif appointment.reminder_method == ReminderMethod.sms:
            await send_sms(appointment.client_phone, appointment.client_name, appointment.service)
        elif appointment.reminder_method == ReminderMethod.whatsapp:
            await send_whatsapp(appointment.client_phone, appointment.client_name, appointment.service)
        elif appointment.reminder_method == ReminderMethod.telegram:
            await send_telegram(appointment.client_phone, appointment.client_name, appointment.service)
        await session.commit()
        await session.refresh(appointment)
        return {'success': True, "message": "Cancellation notice sent"}
    