from fastapi import APIRouter, Depends, Request, Header, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.domain.billing.service import BillingService
from app.domain.user.models import User


router = APIRouter(prefix="/billing", tags=["billing"])
billing_service = BillingService()


@router.post("/create-checkout-session")
def create_checkout_session(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    # Get price_id from query params or body
    price_id = request.query_params.get("price_id")
    if not price_id:
        raise HTTPException(status_code=400, detail="Price ID is required")
        
    checkout_url = billing_service.create_checkout_session(current_user.id, price_id)
    return {"checkout_url": checkout_url}

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)):
    payload = await request.body()
    return billing_service.handle_webhook(db, payload, stripe_signature)
