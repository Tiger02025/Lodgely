import pytest
from fastapi.testclient import TestClient
from main import app, generate_reasons, preprocess_text, Candidate

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "ai-matching"}


def test_match_endpoint():
    user = Candidate(id="user1", first_name="Alex", university="MIT")
    candidates = [
        Candidate(id="user2", first_name="Sam", university="MIT"),
        Candidate(id="user3", first_name="Taylor", university="Stanford"),
    ]
    request = {
        "user_id": "user1",
        "user_profile": user.model_dump(),
        "candidates": [c.model_dump() for c in candidates],
    }
    response = client.post("/match", json=request)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user1"
    assert len(data["matches"]) > 0
    for match in data["matches"]:
        assert 0 <= match["score"] <= 1
        assert len(match["reasons"]) > 0


def test_preprocess_text():
    assert preprocess_text("Hello World  ") == "hello world"
    assert preprocess_text("") == ""
    assert preprocess_text(None) == ""


def test_generate_reasons_same_university():
    user = Candidate(id="u1", university="MIT", bio="I love coding and hiking")
    candidate = Candidate(id="u2", university="MIT", bio="Coding and hiking are my hobbies")
    reasons = generate_reasons(user, candidate, 0.8, [])
    assert any("same university" in r for r in reasons)


def test_similarity_endpoint():
    response = client.post("/similarity", json=["hello world", "hello there"])
    assert response.status_code == 200
    data = response.json()
    assert "similarity_matrix" in data
    assert "pairwise_scores" in data


def test_preferences_endpoint():
    response = client.post("/preferences", json="I love coding and hiking")
    assert response.status_code == 200
    data = response.json()
    assert data["word_count"] > 0
    assert "key_phrases" in data
