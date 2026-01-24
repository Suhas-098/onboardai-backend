import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

#homepage testing
def test_homepage(client):
    response = client.get("/")
    assert response.status_code == 200


#user testing
def test_create_user(client):
    payload = {
        "name": "Test User",
        "email": "test1@example.com",
        "role": "Student"
    }

    response = client.post("/api/users", json=payload)
    
    assert response.status_code == 201
    assert response.json["message"] == "User created successfully"


def test_get_users(client):
    response = client.get("/api/users")
    assert response.status_code == 200


#task testing
def test_create_task(client):
    payload = {
        "title": "Learn Pytest"
    }

    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201


def test_get_tasks(client):
    response = client.get("/api/tasks")
    assert response.status_code == 200


#progress testing
def test_create_progress(client):
    payload = {
        "user_id": 1,
        "task_id": 1,
        "completion": 80,
        "delay_days": 0
    }

    response = client.post("/api/progress", json=payload)
    assert response.status_code == 201


def test_get_progress(client):
    response = client.get("/api/progress")
    assert response.status_code == 200
