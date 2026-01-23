from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_checkout_session(db_session, normal_user_token_headers):
    with patch('app.domain.billing.service.stripe.checkout.Session.create') as mock_create:
        mock_create.return_value = MagicMock(url="https://checkout.stripe.com/test")
        
        response = client.post(
            "/api/v1/billing/create-checkout-session?price_id=price_test",
            headers=normal_user_token_headers
        )
        
        assert response.status_code == 200
        assert response.json() == {"checkout_url": "https://checkout.stripe.com/test"}
        mock_create.assert_called_once()

def test_create_checkout_session_no_auth(db_session):
    response = client.post(
        "/api/v1/billing/create-checkout-session?price_id=price_test",
    )
    assert response.status_code == 401
