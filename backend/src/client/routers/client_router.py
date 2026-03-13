from fastapi import APIRouter, Request, Depends
from src.client.services.ClientService import ClientService
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from database import get_async_session
import uuid
from src.client.schemas.client_schemas import ClientCreate, ClientUpdate

router = APIRouter()
client_service = ClientService()

@router.get("/clients")
async def get_clients(request: Request, session: AsyncSession = Depends(get_async_session)):
    return await client_service.get_clients(session, request)

@router.get("/clients/search")
async def search_clients(request: Request, q: str = "", session: AsyncSession = Depends(get_async_session)):
    return await client_service.search_clients(q, session, request)

@router.get("/clients/{id}")
async def get_client_by_id(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await client_service.get_client_by_id(id, session)

@router.get("/clients/phone/{phone}")
async def get_client_by_phone(phone: str, session: AsyncSession = Depends(get_async_session)):
    return await client_service.get_client_by_phone(phone, session)

@router.post("/clients")
async def create_client(request: Request, client: ClientCreate, session: AsyncSession = Depends(get_async_session)):
    return await client_service.create_client(client, session, request)

@router.put("/clients/{id}")
async def update_client(id: uuid.UUID, client: ClientUpdate, session: AsyncSession = Depends(get_async_session)):
    return await client_service.update_client(id, client, session)

@router.delete("/clients/{id}")
async def delete_client(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await client_service.delete_client(id, session)

@router.get("/clients/{id}/appointments")
async def get_client_appointments(id: uuid.UUID, session: AsyncSession = Depends(get_async_session)):
    return await client_service.get_client_appointments(id, session)