from typing import Optional
import stripe
from app.core.config import settings
from app.domain.billing.models import Subscription, SubscriptionStatus
from sqlalchemy.orm import Session
from fastapi import HTTPException

stripe.api_key = settings.STRIPE_API_KEY

class BillingService:
    def create_checkout_session(self, user_id: int, price_id: str) -> str:
        try:
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=settings.DOMAIN + '/dashboard?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=settings.DOMAIN + '/pricing',
                metadata={
                    "user_id": str(user_id)
                }
            )
            return checkout_session.url
        except Exception as e:
            print(f"Stripe Error: {e}")
            raise HTTPException(status_code=400, detail="Failed to create checkout session")

    def handle_webhook(self, db: Session, payload: bytes, sig_header: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(status_code=400, detail="Invalid signature")

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self._handle_checkout_completed(db, session)
        
        return {"status": "success"}

    def _handle_checkout_completed(self, db: Session, session):
        user_id = session.get("metadata", {}).get("user_id")
        subscription_id = session.get("subscription")
        
        if user_id:
             # In a real app, you would fetch the subscription details from Stripe
             # to get current_period_end, etc.
             print(f"User {user_id} subscribed with ID {subscription_id}")
             # logic to update user's subscription in DB would go here
             pass
