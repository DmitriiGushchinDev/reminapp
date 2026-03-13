from fastapi.security import OAuth2PasswordBearer
from jose import jwt 
from config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from database import get_async_session
from fastapi import HTTPException
from clerk_backend_api import Clerk, AuthenticateRequestOptions
import os
from dotenv import load_dotenv
from src.auth.models.auth_model import User
from sqlalchemy import select
from fastapi import Request, Depends
from datetime import datetime
import uuid
from src.auth.schemas.user_schemas import UserCreate

load_dotenv()

clerk_sdk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

async def authenticate_and_get_user_details(request: Request, session: AsyncSession = Depends(get_async_session)):
    try:
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        print("")
        request_state = clerk_sdk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=['http://localhost:5173', 'http://localhost:5174'],
                jwt_key=os.getenv("CLERK_PUBLISHABLE_KEY"),
            ),
        )
        if not request_state.is_signed_in:
            raise HTTPException(status_code=401, detail="Invalid Token")
        
        # Get user info from Clerk
        user_info = request_state.to_dict()
        user_id = user_info.get('sub')
        
        # Get full user info from Clerk
        clerk_user = clerk_sdk.users.get(user_id)
        
        # Check if user exists in our database
        query = select(User).where(User.email == clerk_user.email_addresses[0].email_address)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        # If user doesn't exist, create them
        if not user:
            user = User(
                id=uuid.uuid4(),
                name=f"{clerk_user.first_name} {clerk_user.last_name}".strip() or clerk_user.username or "Unknown",
                email=clerk_user.email_addresses[0].email_address,
                is_provider=True,  # Default to provider for now
                is_active=True,
                is_subscribed=False,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
        
        return user
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

async def get_current_user(current_user: User = Depends(authenticate_and_get_user_details)):
    if not current_user.is_active:
        raise HTTPException(status_code=401, detail="Inactive User")
    return current_user

class UserService:
    async def get_user(self, email: str, session: AsyncSession, current_user: User = Depends(authenticate_and_get_user_details)):
        query = select(User).where(User.email == email)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        return user
    
    