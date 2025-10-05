import math
import json
import requests
from flask import Flask, jsonify, request
from shapely.geometry import Polygon, mapping

# This will store the population from API 1
stored_population = None

def get_bounding_box(lat, lon, distance_km):
    """Return (lat_min, lon_min, lat_max, lon_max) for a box ±distance_km around a point."""
    delta_lat = distance_km / 111.0
    delta_lon = distance_km / (111.0 * math.cos(math.radians(lat)))
    return lat - delta_lat, lon - delta_lon, lat + delta_lat, lon + delta_lon


def get_total_population(lat, lon, distance_km, year):
    """Fetch total population within a given radius using WorldPop API."""
    
    # Get bounding box coordinates
    lat1, lon1, lat2, lon2 = get_bounding_box(lat, lon, distance_km)

    # Create polygon
    polygon = Polygon([
        (lon1, lat1),
        (lon1, lat2),
        (lon2, lat2),
        (lon2, lat1),
        (lon1, lat1)
    ])
    geojson = {"type": "FeatureCollection", "features": [
        {"type": "Feature", "properties": {}, "geometry": mapping(polygon)}
    ]}
    geojson_str = json.dumps(geojson, separators=(",", ":"))

    # WorldPop API request
    url = "https://api.worldpop.org/v1/services/stats"
    params = {
        "dataset": "wpgppop",
        "year": year,
        "geojson": geojson_str,
        "runasync": "false"
    }

    response = requests.get(url, params=params, timeout=120)
    response.raise_for_status()
    data = response.json()

    # Extract total population
    total_population = data.get("data", {}).get("total_population", None)
    if total_population is None:
        raise ValueError(f"Unexpected response:\n{json.dumps(data, indent=2)}")

    return total_population


def calculate_impact_effects(kinetic_energy, population):
    """Estimate the effects of an asteroid impact based on kinetic energy and population."""
    
    # Energy to shockwave intensity (approximate scaling)
    energy_factor = kinetic_energy / 1000  # Example factor (scale this as needed)
    fatality_percentage = min(100, max(0, energy_factor * 2))  # Assume fatalities scale linearly with energy

    # Calculate the number of fatalities based on population
    fatalities_estimate = population * (fatality_percentage / 100)

    # Calculate the affected area (in population terms)
    affected_population = min(population, fatalities_estimate)

    # Impact effects output
    effects = {
        "shock_wave": "Severe structural damage likely",  # As per your requirement
        "fatalities": f"{fatality_percentage}% fatalities",
        "estimated_population_effect": affected_population
    }

    return effects
