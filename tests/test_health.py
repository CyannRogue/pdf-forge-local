from fastapi.testclient import TestClient

from app.main import app


def test_health_and_root():
    client = TestClient(app)
    r = client.get("/health")
    assert r.status_code == 200
    j = r.json()
    assert j.get("status") == "ok"
    assert "request_id" in j

    r2 = client.get("/")
    assert r2.status_code == 200
    j2 = r2.json()
    assert j2.get("version") == "0.3.0"
    assert j2.get("name") == "PDF Forge Local"
    assert "request_id" in j2
