from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_async_session
from src.auth.services.UserService import authenticate_and_get_user_details, get_current_user
from src.appointment.services.AppointmentServices import get_current_user_and_sync
from src.auth.models.auth_model import User
from src.auth.schemas.user_schemas import UserUpdate, UserResponse
from sqlalchemy import select
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """Get current user profile"""
    try:
        # Get user details from Clerk token
        user_details = await get_current_user_and_sync(request)
        
        # Query user by email from database
        query = select(User).where(User.email == user_details['email'])
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """Update current user profile"""
    try:
        # Get user details from Clerk token
        user_details = await get_current_user_and_sync(request)
        
        # Query user by email from database
        query = select(User).where(User.email == user_details['email'])
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user fields
        if user_update.name is not None:
            user.name = user_update.name
        if user_update.phone_number is not None:
            user.phone_number = user_update.phone_number
        if user_update.telegram_id is not None:
            user.telegram_id = user_update.telegram_id
        if user_update.business_name is not None:
            user.business_name = user_update.business_name
        
        user.updated_at = datetime.now()
        
        await session.commit()
        await session.refresh(user)
        
        return user
    except Exception as e:
        await session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/clients/{provider_id}")
async def get_provider_clients(
    provider_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
):
    """Get all clients for a specific provider"""
    try:
        # Get current user to verify they can access this data
        current_user = await get_current_user_and_sync(request)
        
        # Query clients through the provider-client relationship
        from src.auth.models.auth_model import ProviderAndClient
        from src.client.models.client_model import Client
        
        query = select(Client).join(
            ProviderAndClient, Client.id == ProviderAndClient.client_id
        ).where(ProviderAndClient.provider_id == current_user['id'])
        
        result = await session.execute(query)
        clients = result.scalars().all()
        
        return clients
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))