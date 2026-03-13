from fastapi import HTTPException, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.client.models.client_model import Client
from src.client.schemas.client_schemas import ClientCreate, ClientUpdate, ClientResponse
from sqlalchemy import select
import uuid
from datetime import datetime
from src.appointment.models.appointment_models import Appointment
from src.auth.models.auth_model import User
from src.appointment.services.AppointmentServices import get_current_user_and_sync

class ClientService:
    async def get_clients(self, session: AsyncSession, request: Request):
        if request:
            # Get current provider and return only their clients
            current_user = await get_current_user_and_sync(request)
            
            # Get clients through provider-client relationship
            provider = await session.execute(select(User).where(User.email == current_user['email']))
            provider = provider.scalar_one_or_none()
            clients = await session.execute(select(Client).where(Client.provider_id == provider.id))
            return clients.scalars().all()
        else:
            # Return all clients (fallback)
            clients = await session.execute(select(Client))
            return clients.scalars().all()
    
    async def get_client_by_id(self, client_id: uuid.UUID, session: AsyncSession):
        client = await session.get(Client, client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client
    
    async def get_client_by_phone(self, phone: str, session: AsyncSession):
        result = await session.execute(select(Client).where(Client.phone == phone))
        return result.scalars().first()
    
    async def get_client_by_email(self, email: str, session: AsyncSession):
        result = await session.execute(select(Client).where(Client.email == email))
        return result.scalars().first()
    
    async def search_clients(self, query: str, session: AsyncSession, request: Request):
        current_user = await get_current_user_and_sync(request)
        provider = await session.execute(select(User).where(User.email == current_user['email']))
        provider = provider.scalar_one_or_none()
        
        if not query:
            # Return all clients if no query
            clients = await session.execute(select(Client).where(Client.provider_id == provider.id))
            return clients.scalars().all()
        
        # Search by name or phone
        clients = await session.execute(
            select(Client).where(
                Client.provider_id == provider.id,
                (Client.name.ilike(f"%{query}%")) | (Client.phone.ilike(f"%{query}%"))
            )
        )
        return clients.scalars().all()

    async def create_client(self, client_data: ClientCreate, session: AsyncSession, request: Request):
        # Create the client
        provider_email = await get_current_user_and_sync(request)
        provider = await session.execute(select(User).where(User.email == provider_email['email']))
        provider = provider.scalar_one_or_none()
        # If we have a request (authenticated user), create provider-client relationship
        existing_client = await session.execute(select(Client).where(Client.phone == client_data.phone))
        existing_client = existing_client.scalar_one_or_none()
        if existing_client:
            raise HTTPException(status_code=400, detail="Client already exists")
        provider_client = Client(
                id=uuid.uuid4(),
                provider_id=provider.id,
                name=client_data.name,
                phone=client_data.phone,
                email=client_data.email,
                notes=client_data.notes,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        session.add(provider_client)
        await session.commit()
        await session.refresh(provider_client)
        return ClientResponse(
            id=provider_client.id,
            name=provider_client.name,
            phone=provider_client.phone,
            email=provider_client.email,
            notes=provider_client.notes,
            created_at=provider_client.created_at,
            updated_at=provider_client.updated_at
        )

    async def update_client(self, client_id: uuid.UUID, client_update: ClientUpdate, session: AsyncSession):
        db_client = await session.get(Client, client_id)
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Update only provided fields
        update_data = client_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_client, field, value)
        
        db_client.updated_at = datetime.now()
        
        await session.commit()
        await session.refresh(db_client)
        return db_client
    
    async def delete_client(self, client_id: uuid.UUID, session: AsyncSession):
        db_client = await session.get(Client, client_id)
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        await session.delete(db_client)
        await session.commit()
        return db_client
    
    async def get_client_appointments(self, client_id: uuid.UUID, session: AsyncSession):
        db_client = await session.get(Client, client_id)
        if not db_client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        result = await session.execute(select(Appointment).where(Appointment.client_id == client_id))
        return result.scalars().all()