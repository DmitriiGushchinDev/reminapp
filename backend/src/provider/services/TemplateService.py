from datetime import datetime
from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.appointment.services.AppointmentServices import get_current_user_and_sync
from src.auth.models.auth_model import User
from src.provider.models.provider_models import Template
from src.provider.schemas.provider_schemas import TemplateCreate, TemplateUpdate
from sqlalchemy import select

class TemplateService:
    async def get_templates(self, session: AsyncSession, request: Request):
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        templates = await session.execute(select(Template).where(Template.provider_id == user.id))
        return templates.scalars().all()
    
    async def get_template_by_id(self, template_id: int, session: AsyncSession):
        template = await session.get(Template, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        return template
    
    async def create_template(self, template: TemplateCreate, session: AsyncSession,request: Request):
        user_info = await get_current_user_and_sync(request)
        user = await session.execute(select(User).where(User.email == user_info['email']))
        user = user.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        new_template = Template(
            name=template.name,
            content=template.content,
            variables=template.variables,
            provider_id=user.id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        session.add(new_template)
        await session.commit()
        await session.refresh(new_template)
        return new_template

    async def update_template(self, template_id: int, template_update: TemplateUpdate, session: AsyncSession):
        template = await session.get(Template, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        if template_update.name:
            template.name = template_update.name
        if template_update.content:
            template.content = template_update.content
        if template_update.variables:
            template.variables = template_update.variables
        await session.commit()
        await session.refresh(template)
        return template
    
    async def delete_template(self, template_id: int, session: AsyncSession):
        template = await session.get(Template, template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        await session.delete(template)
        await session.commit()
        return template