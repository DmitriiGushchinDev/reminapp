from fastapi import APIRouter, Depends, Request
from src.provider.services.TemplateService import TemplateService
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from database import get_async_session
from src.provider.schemas.provider_schemas import TemplateCreate, TemplateUpdate

router = APIRouter()
template_service = TemplateService()
@router.get("/templates")
async def get_templates(request: Request, session: AsyncSession = Depends(get_async_session)):
    return await template_service.get_templates(session, request)

@router.get("/templates/{id}")
async def get_template_by_id(id: int, session: AsyncSession = Depends(get_async_session)):
    return await template_service.get_template_by_id(id, session)

@router.post("/templates")
async def create_template(template: TemplateCreate, request: Request,session: AsyncSession = Depends(get_async_session)):
    return await template_service.create_template(template, session,request)

@router.put("/templates/{id}")
async def update_template(id: int, template_update: TemplateUpdate, session: AsyncSession = Depends(get_async_session)):
    return await template_service.update_template(id, template_update, session)

@router.delete("/templates/{id}")
async def delete_template(id: int, session: AsyncSession = Depends(get_async_session)):
    return await template_service.delete_template(id, session)