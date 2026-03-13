from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from .stripe_service import StripeService

router = APIRouter(prefix="/stripe", tags=["stripe"])

class CheckoutRequest(BaseModel):
    price_id: str
    customer_email: str
    success_url: str
    cancel_url: str

class SubscriptionRequest(BaseModel):
    price_id: str
    customer_email: str
    success_url: str
    cancel_url: str

class CancelSubscriptionRequest(BaseModel):
    subscription_id: str

class PortalRequest(BaseModel):
    customer_id: str
    return_url: str

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    """Create a Stripe checkout session for one-time payment"""
    try:
        session = StripeService.create_checkout_session(
            price_id=request.price_id,
            customer_email=request.customer_email,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        return {"sessionId": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-subscription-checkout")
async def create_subscription_checkout(request: SubscriptionRequest):
    """Create a Stripe checkout session for subscription"""
    try:
        session = StripeService.create_subscription_checkout(
            price_id=request.price_id,
            customer_email=request.customer_email,
            success_url=request.success_url,
            cancel_url=request.cancel_url
        )
        return {"sessionId": session.id, "url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cancel-subscription")
async def cancel_subscription(request: CancelSubscriptionRequest):
    """Cancel a subscription"""
    try:
        subscription = StripeService.cancel_subscription(request.subscription_id)
        return {"success": True, "subscription": subscription}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-portal-session")
async def create_portal_session(request: PortalRequest):
    """Create a billing portal session"""
    try:
        session = StripeService.create_portal_session(
            customer_id=request.customer_id,
            return_url=request.return_url
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
