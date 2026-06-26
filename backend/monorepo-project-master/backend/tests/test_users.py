import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.test import TestCase, Client
from django.test.utils import setup_test_environment

setup_test_environment()


class UserAPITest(TestCase):
    def test_list_users_empty(self):
        client = Client()
        response = client.get("/api/users/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_create_user(self):
        client = Client()
        response = client.post(
            "/api/users/create/",
            data='{"name": "Alice", "email": "alice@example.com"}',
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["name"], "Alice")

    def test_health(self):
        client = Client()
        response = client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")
