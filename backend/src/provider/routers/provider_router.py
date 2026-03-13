from fastapi import APIRouter, Request, Depends
from src.provider.services.ProviderService import ProviderService
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
import uuid
from src.provider.schemas.provider_schemas import ServiceCreate, ServiceUpdate
provider_service = ProviderService()
router = APIRouter()

@router.get("/services")
async def get_services(request: Request, session: AsyncSession = Depends(get_async_session)):
    return await provider_service.get_services(session, request)

@router.get("/services/{id}")
async def get_service_by_id(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await provider_service.get_service_by_id(id, session)

@router.post("/services")
async def create_service(request: Request, service: ServiceCreate, session: AsyncSession = Depends(get_async_session)):
    return await provider_service.create_service(service, session, request)

@router.put("/services/{id}")
async def update_service(id: uuid.UUID, service: ServiceUpdate, session: AsyncSession = Depends(get_async_session)):
    return await provider_service.update_service(id, service, session)

@router.delete("/services/{id}")
async def delete_service(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await provider_service.delete_service(id, session)