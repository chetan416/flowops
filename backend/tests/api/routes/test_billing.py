from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.api.deps import get_current_user

client = TestClient(app)

# Mock User model
class MockUser:
    id = 1
    email = "test@example.com"
    role = "user"
    plan = "free"

def mock_get_current_user():
    return MockUser()

app.dependency_overrides[get_current_user] = mock_get_current_user

def test_create_checkout_session():
    # Patch the BillingService inside the billing route module or where it's instantiated
    # Since billing_service is instantiated at module level in routes/billing.py, 
    # we need to patch the method on that instance or the class method if it was static.
    # It's an instance `billing_service = BillingService()`.
    
    with patch('app.api.v1.routes.billing.billing_service.create_checkout_session') as mock_create:
        mock_create.return_value = "https://checkout.stripe.com/test-url"
        
        response = client.post(
            "/api/v1/billing/create-checkout-session?price_id=price_test_123"
        )
        
        assert response.status_code == 200
        assert response.json() == {"checkout_url": "https://checkout.stripe.com/test-url"}
        mock_create.assert_called_with(1, "price_test_123")

def test_webhook_payment_succeeded():
    # Mocking the handle_webhook method
    with patch('app.api.v1.routes.billing.billing_service.handle_webhook') as mock_webhook:
        mock_webhook.return_value = {"status": "success"}
        
        # We need to send signature header
        headers = {"Stripe-Signature": "t=123,v1=signature"}
        response = client.post(
            "/api/v1/billing/webhook",
            content=b'{"type": "checkout.session.completed"}',
            headers=headers
        )
        
        assert response.status_code == 200
        assert response.json() == {"status": "success"}
        mock_webhook.assert_called_once()
