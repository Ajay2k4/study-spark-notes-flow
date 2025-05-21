
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)


# Basic test for authentication routes
def test_register_user():
    # This is a basic test, in a real scenario you'd use pytest fixtures
    # to handle database mocking/connection
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_login_user():
    # Assuming user was created in previous test
    response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
