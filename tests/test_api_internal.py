import unittest
import json
from backend.app import create_app

class TestGlucoTwinAPI(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "healthy")

    def test_list_patients(self):
        res = self.client.get("/api/patients")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("patients", data)
        self.assertGreater(len(data["patients"]), 0)

    def test_digital_twin_state(self):
        res = self.client.get("/api/digital-twin/GT-001")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["patient_id"], "GT-001")
        self.assertIn("prediction", data)
        self.assertIn("risk_percentage", data["prediction"])

    def test_simulation(self):
        payload = {
            "patient_id": "GT-001",
            "simulations": {
                "steps": 8000,
                "sleep_hours_last_night": 8.0,
                "carbs_intake_g": 20.0
            }
        }
        res = self.client.post("/api/digital-twin/simulate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("baseline", data)
        self.assertIn("simulated", data)
        self.assertIn("comparison", data)

if __name__ == "__main__":
    unittest.main()
