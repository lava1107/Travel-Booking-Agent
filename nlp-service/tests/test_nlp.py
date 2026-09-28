import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app, analyze, AnalyzeRequest


def test_health():
    from fastapi.testclient import TestClient
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


def test_intent_and_ner():
    req = AnalyzeRequest(message="Looking for a beach vacation in Goa under 25000 for 2 people")
    res = analyze(req)
    assert res.intent == "search_trips"
    assert res.entities.get("destination") == "Goa"
    assert res.entities.get("budget") == 25000
    assert res.entities.get("passengers") == 2
    assert res.entities.get("travel_type") == "beach"
    assert res.confidence > 0.3


def test_multiturn_context():
    # Turn 1: user mentions destination
    req1 = AnalyzeRequest(message="Plan a trip to Manali")
    res1 = analyze(req1)
    assert res1.context.get("destination") == "Manali"

    # Turn 2: user mentions budget without repeating destination
    req2 = AnalyzeRequest(message="under 15000", context=res1.context)
    res2 = analyze(req2)
    assert res2.context.get("destination") == "Manali"
    assert res2.context.get("budget") == 15000

    # Turn 3: user mentions passengers
    req3 = AnalyzeRequest(message="for 3 travelers", context=res2.context)
    res3 = analyze(req3)
    assert res3.context.get("destination") == "Manali"
    assert res3.context.get("budget") == 15000
    assert res3.context.get("passengers") == 3


if __name__ == "__main__":
    print("Running NLP unit tests...")
    test_health()
    print("[PASS] Health test passed")
    test_intent_and_ner()
    print("[PASS] Intent & NER test passed")
    test_multiturn_context()
    print("[PASS] Multi-turn Context tracking test passed")
    print("All NLP tests passed successfully!")
