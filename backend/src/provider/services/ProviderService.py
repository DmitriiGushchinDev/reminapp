from fastapi import HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.provider.schemas.provider_schemas import ServiceCreate, ServiceUpdate
from src.provider.models.provider_models import Service
import uuid
from datetime import datetime
from src.auth.models.auth_model import User
from src.appointment.services.AppointmentServices import get_current_user_and_sync

class ProviderService:
    async def get_services(self, session: AsyncSession, request: Request):
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        services = await session.execute(select(Service).where(Service.provider_id == user.id))
        return services.scalars().all()
    
    async def get_service_by_id(self, service_id: uuid.UUID, session: AsyncSession):
        service = await session.get(Service, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return service

    async def create_service(self, service: ServiceCreate, session: AsyncSession, request: Request):
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        service = Service(
            name=service.name,
            duration=service.duration,
            price=service.price,
            provider_id=user.id
        )
        service.created_at = datetime.now()
        service.updated_at = datetime.now()
        session.add(service)
        await session.commit()
        await session.refresh(service)
        return service
    
    async def update_service(self, service_id: uuid.UUID, service_new: ServiceUpdate, session: AsyncSession):
        service = await session.get(Service, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        service.name = service_new.name
        service.duration = service_new.duration
        service.price = service_new.price
        service.updated_at = datetime.now()
        await session.commit()
        await session.refresh(service)
        return service
        
    async def delete_service(self, service_id: uuid.UUID, session: AsyncSession):
        service = await session.get(Service, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        await session.delete(service)
        await session.commit()
        return service


class UserService:
    async def get_user_by_id(self, user_id: uuid.UUID, session: AsyncSession):
        user = await session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
