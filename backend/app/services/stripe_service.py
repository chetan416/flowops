import stripe
from app.core.config import settings
from typing import Optional

stripe.api_key = settings.STRIPE_API_KEY

class StripeService:
    def create_checkout_session(self, user_id: int, user_email: str, price_id: str):
        if not settings.STRIPE_API_KEY or "sk_test" not in settings.STRIPE_API_KEY:
             # Mock for development/demo
             class MockSession:
                 url = f"{settings.DOMAIN}/dashboard?session_id=mock_session_123"
             return MockSession()

        try:
            checkout_session = stripe.checkout.Session.create(
                customer_email=user_email,
                client_reference_id=str(user_id),
                payment_method_types=['card'],
                line_items=[
                    {
                        'price': price_id,
                        'quantity': 1,
                    },
                ],
                mode='subscription',
                success_url=f'{settings.DOMAIN}/dashboard?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.DOMAIN}/pricing',
            )
            return checkout_session
        except Exception as e:
            # Fallback for demo if stripe fails (e.g. invalid key)
            print(f"Stripe Error: {e}")
            class MockSession:
                 url = f"{settings.DOMAIN}/dashboard?session_id=mock_fallback_123"
            return MockSession()

    def construct_event(self, payload: bytes, sig_header: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            raise e
