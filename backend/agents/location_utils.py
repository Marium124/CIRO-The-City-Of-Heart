"""
Location Utilities - Dynamic Geocoding and Vulnerability Data for Pakistan
Handles the transition from hardcoded Islamabad sectors to national scalability.
"""

from typing import Dict, Any, List

class LocationUtils:
    """Utilities for handling Pakistan-wide location logic"""
    
    # Mock vulnerability data for major cities in Pakistan
    # In production, this would come from a census/GIS database
    PROVINCIAL_DATA = {
        "Islamabad": {
            "vulnerability_score": 0.4,
            "population_density": "high",
            "medical_infrastructure": "excellent",
            "vulnerable_hotspots": ["G-12 slums", "Katchi Abadis"]
        },
        "Karachi": {
            "vulnerability_score": 0.8,
            "population_density": "critical",
            "medical_infrastructure": "mixed",
            "vulnerable_hotspots": ["Lyari", "Orangi Town", "Clifton Coastline"]
        },
        "Lahore": {
            "vulnerability_score": 0.6,
            "population_density": "very_high",
            "medical_infrastructure": "good",
            "vulnerable_hotspots": ["Walled City", "Shahdara"]
        },
        "Peshawar": {
            "vulnerability_score": 0.7,
            "population_density": "high",
            "medical_infrastructure": "fair",
            "vulnerable_hotspots": ["Old City", "Bara Road"]
        },
        "Quetta": {
            "vulnerability_score": 0.75,
            "population_density": "medium",
            "medical_infrastructure": "strained",
            "vulnerable_hotspots": ["Hazara Town", "Sariab Road"]
        }
    }

    @staticmethod
    def get_city_from_coords(lat: float, lng: float) -> str:
        """
        Mock reverse geocoding to identify city from coordinates.
        Coordinates are roughly bounded for the demo.
        """
        # Simplistic bounding box check for the demo
        if 33.5 <= lat <= 33.8 and 72.9 <= lng <= 73.2:
            return "Islamabad"
        elif 24.7 <= lat <= 25.1 and 66.9 <= lng <= 67.2:
            return "Karachi"
        elif 31.3 <= lat <= 31.7 and 74.2 <= lng <= 74.5:
            return "Lahore"
        elif 33.9 <= lat <= 34.1 and 71.4 <= lng <= 71.7:
            return "Peshawar"
        elif 30.1 <= lat <= 30.3 and 66.9 <= lng <= 67.1:
            return "Quetta"
        
        return "Unknown Location"

    @staticmethod
    def get_vulnerability_profile(location_name: str, lat: float = None, lng: float = None) -> Dict[str, Any]:
        """Returns the vulnerability profile for a location"""
        city = location_name
        if lat and lng:
            city = LocationUtils.get_city_from_coords(lat, lng)
            
        # Default to a general profile if city not found
        profile = LocationUtils.PROVINCIAL_DATA.get(city, {
            "vulnerability_score": 0.5,
            "population_density": "medium",
            "medical_infrastructure": "standard",
            "vulnerable_hotspots": []
        })
        
        profile["city"] = city
        return profile

    @staticmethod
    def calculate_life_years_saved(crisis_type: str, severity: str, population_density: str) -> float:
        """
        Agentic reasoning tool: Calculates estimated human impact.
        Higher weight for high-density areas and critical severities.
        """
        base_multiplier = {
            "critical": 10.0,
            "high": 5.0,
            "medium": 2.0,
            "low": 1.0
        }
        
        density_weight = {
            "critical": 2.0,
            "very_high": 1.5,
            "high": 1.2,
            "medium": 1.0,
            "low": 0.8
        }
        
        return base_multiplier.get(severity, 1.0) * density_weight.get(population_density, 1.0)
