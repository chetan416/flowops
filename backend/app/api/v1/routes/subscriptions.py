from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.domain.user.models import User
from app.services.stripe_service import StripeService
from typing import Optional

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])
stripe_service = StripeService()

@router.post("/create-checkout-session")
def create_checkout_session(price_id: str, current_user: User = Depends(get_current_user)):
    try:
        session = stripe_service.create_checkout_session(
            user_id=current_user.id,
            user_email=current_user.email,
            price_id=price_id
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(None)):
    try:
        payload = await request.body()
        event = stripe_service.construct_event(payload, stripe_signature)
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            # TODO: Update user subscription status in DB
            print(f"Payment successful for user {session.get('client_reference_id')}")
            
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
