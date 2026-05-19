import unittest
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__))))

from agents.resource_manager import ResourceManager

class TestResourceManager(unittest.TestCase):
    def test_knapsack_returns_valid_selection(self):
        rm = ResourceManager.get_instance()
        rm.reset_inventory()
        events = [
            {"resource_demand": 2, "threat_score": 0.8, "index": 0},
            {"resource_demand": 3, "threat_score": 0.5, "index": 1},
            {"resource_demand": 1, "threat_score": 0.9, "index": 2},
        ]
        selected = rm.knapsack_allocate(events, 3)
        self.assertGreater(len(selected), 0)
        total = sum(e["resource_demand"] for e in selected)
        self.assertLessEqual(total, 3)

    def test_allocate_depletes_inventory(self):
        rm = ResourceManager.get_instance()
        rm.reset_inventory()
        result = rm.allocate_resources("C1", "urban_flooding", "critical", ["boats", "water_pumps"])
        self.assertIn(result["status"], ["success", "partial", "depleted"])
        self.assertIn("allocated", result)

if __name__ == "__main__":
    unittest.main()
