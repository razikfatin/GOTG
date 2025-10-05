import math
import json
import requests
from flask import jsonify, request
from shapely.geometry import Polygon, mapping


def get_bounding_box(lat, lon, distance_km):
    """Return (lat_min, lon_min, lat_max, lon_max) for a box ±distance_km around a point."""
    delta_lat = distance_km / 111.0
    delta_lon = distance_km / (111.0 * math.cos(math.radians(lat)))
    return lat - delta_lat, lon - delta_lon, lat + delta_lat, lon + delta_lon


def get_total_population(lat, lon, distance_km, year):

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
