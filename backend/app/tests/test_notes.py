
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# Test for notes endpoints
def test_create_note():
    # You need to get an auth token first
    # In a real test, use pytest fixtures to handle auth
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    response = client.post(
        "/api/notes",
        json={
            "title": "Test Note",
            "content": "This is a test note content",
            "source_type": "manual",
            "tags": ["test", "example"]
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Note"
    assert "content" in data


def test_get_notes():
    # You need to get an auth token first
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/notes",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
