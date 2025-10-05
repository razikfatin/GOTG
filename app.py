from flask import Flask, jsonify, request
import requests
import numpy as np
from scipy.spatial import KDTree
from math import radians, sin, cos, sqrt, atan2, asin
from model import Ass
from cal_energy import estimate_asteroid_energy
from flask_cors import CORS
from pop import *
from shapely.geometry import Polygon, mapping
from impact import *
DEFAULT_KINETIC_ENERGY = 1000 
app = Flask(__name__)
CORS(app)
DEFAULT_DISTANCE_KM = 70
# -------------------------------
# Global Earthquake Setup
# -------------------------------

EARTHQUAKE_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query.geojson"
EARTHQUAKE_PARAMS = {
    "starttime": "2025-06-01 00:00:00",
    "endtime": "2025-10-03 23:59:59",
    "minmagnitude": 2.5,
    "eventtype": "earthquake",
    "orderby": "magnitude",
    "format": "geojson"
}

# Global data
earthquake_coords = []
earthquake_metadata = []
earthquake_tree = None
selected_ass = {}



# -------------------------------
# Haversine Distance
# -------------------------------

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


# -------------------------------
# Load Earthquake Data & KD-tree
# -------------------------------

def load_earthquake_data():
    global earthquake_coords, earthquake_metadata, earthquake_tree

    print("Fetching earthquake data...")
    response = requests.get(EARTHQUAKE_API_URL, params=EARTHQUAKE_PARAMS)

    if response.status_code != 200:
        print("Failed to load earthquake data")
        return

    data = response.json()
    features = data.get("features", [])
    earthquake_coords = []
    earthquake_metadata = []
    for eq in features:
        
        lon, lat, _ = eq["geometry"]["coordinates"]
        if(eq["properties"]["tsunami"] == 1):
            print("1")
            print(lat,lon)
        earthquake_coords.append([lat, lon])
        earthquake_metadata.append({
            "title": eq["properties"]["title"],
            "place": eq["properties"]["place"],
            "magnitude": eq["properties"]["mag"],
            "url": eq["properties"]["url"],
            "tsunami" : eq["properties"]["tsunami"],
            "lat": lat,
            "lon": lon
        })
    
    if earthquake_coords:
        earthquake_tree = KDTree(np.array(earthquake_coords))
        print(f"Loaded {len(earthquake_coords)} earthquake records.")



# -------------------------------
# Core Function: Get Nearby EQs
# -------------------------------

def get_nearby_earthquakes(lat, lon, radius_km=1000):
    if not earthquake_tree:
        print("lol")
        return []
    # Approximate degrees (Euclidean space)
    approx_deg_radius = radius_km / 111.0
    print("nice")
    # Fast lookup with KDTree
    indices = earthquake_tree.query_ball_point([lat, lon], r=approx_deg_radius)
    print(indices)
    results = []
    for i in indices:
        print(i)
        eq = earthquake_metadata[i]
        dist = haversine(lat, lon, eq["lat"], eq["lon"])
        if dist <= radius_km:
            eq_with_dist = dict(eq)
            eq_with_dist["distance_km"] = round(dist, 2)
            results.append(eq_with_dist)
    print(results)
    return results

# def deduplicate_by_distance(results, min_dist_km=100):
#     clustered = []
#     for eq in results:
#         too_close = False
#         for existing in clustered:
#             d = haversine(eq["lat"], eq["lon"], existing["lat"], existing["lon"])
#             if d < min_dist_km:
#                 too_close = True
#                 break
#         if not too_close:
#             clustered.append(eq)
#     return clustered
def deduplicate_by_distance(results, min_dist_km=100):
    clustered = []

    for eq in results:
        eq_lat = eq["lat"]
        eq_lon = eq["lon"]
        eq_tsunami = eq.get("tsunami", 0)

        too_close_idx = None

        for idx, existing in enumerate(clustered):
            d = haversine(eq_lat, eq_lon, existing["lat"], existing["lon"])
            if d < min_dist_km:
                too_close_idx = idx
                break

        if too_close_idx is not None:
            # There's a nearby event already added
            existing_eq = clustered[too_close_idx]
            existing_tsunami = existing_eq.get("tsunami", 0)

            # If the new one has tsunami == 1 and the old one doesn't, replace it
            if eq_tsunami == 1 and existing_tsunami != 1:
                clustered[too_close_idx] = eq  # Replace
        else:
            # No nearby event, so just add it
            clustered.append(eq)

    return clustered


# -------------------------------
# API Routes
# -------------------------------

@app.route('/earthquakes/nearby', methods=['GET'])
def get_nearby_earthquakes_route():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "Missing 'lat' or 'lon' query parameter"}), 400
    print(lat,lon)
    results = get_nearby_earthquakes(lat, lon, 800)
    results = deduplicate_by_distance(results, 500)
    return jsonify(results)


# ----------------------
# Global Variables
# ----------------------
# earthquake_metadata = []
# earthquake_tree = None
# earthquake_coords = []

# # ----------------------
# # Config
# # ----------------------
# EARTHQUAKE_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query.geojson"
# EARTHQUAKE_PARAMS = {
#     "starttime": "2025-06-01 00:00:00",
#     "endtime": "2025-10-03 23:59:59",
#     "minmagnitude": 2.5,
#     "eventtype": "earthquake",
#     "orderby": "magnitude",
#     "format": "geojson"
# }

# # ----------------------
# # Utils
# # ----------------------
# def haversine(lat1, lon1, lat2, lon2):
#     R = 6371.0
#     lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
#     dlat = lat2 - lat1
#     dlon = lon2 - lon1
#     a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
#     return R * 2 * atan2(sqrt(a), sqrt(1 - a))

# # ----------------------
# # Load Earthquake Data at Startup
# # ----------------------
# def load_earthquake_data():
#     global earthquake_metadata, earthquake_tree, earthquake_coords

#     print("Fetching earthquake data from USGS...")
#     response = requests.get(EARTHQUAKE_API_URL, params=EARTHQUAKE_PARAMS)

#     if response.status_code != 200:
#         print("Failed to load earthquake data")
#         return

#     data = response.json()
#     features = data.get("features", [])

#     earthquake_coords = []
#     earthquake_metadata = []

#     for eq in features:
#         try:
#             lon, lat, _ = eq["geometry"]["coordinates"]
#             props = eq["properties"]
#             earthquake_coords.append([lat, lon])
#             earthquake_metadata.append({
#                 "title": props.get("title"),
#                 "place": props.get("place"),
#                 "magnitude": props.get("mag"),
#                 "url": props.get("url"),
#                 "tsunami": props.get("tsunami", 0),
#                 "lat": lat,
#                 "lon": lon
#             })
#         except Exception as e:
#             print(f"Skipping bad data: {e}")

#     if earthquake_coords:
#         earthquake_tree = KDTree(np.array(earthquake_coords))
#         print(f"Loaded {len(earthquake_coords)} earthquakes into KDTree.")
#     else:
#         print("No valid earthquake data to build KDTree.")

# # ----------------------
# # API Route
# @app.route('/earthquakes/nearby', methods=['GET'])
# def get_nearby_earthquakes():
#     if not earthquake_tree:
#         return jsonify({"error": "Earthquake data not loaded"}), 500

#     lat = request.args.get("lat", type=float)
#     lon = request.args.get("lon", type=float)
#     radius_km = request.args.get("radius_km", default=800, type=float)
#     tsunami_only = request.args.get("tsunami_only", default=0, type=int)

#     if lat is None or lon is None:
#         return jsonify({"error": "Missing 'lat' or 'lon'"}), 400

#     approx_deg_radius = radius_km / 111.0
#     epsilon = 1e-6  # Extra buffer to catch exact duplicates
#     indices = earthquake_tree.query_ball_point([lat, lon], r=approx_deg_radius + epsilon)

#     results = []
#     for i in indices:
#         eq = earthquake_metadata[i]
#         dist = haversine(lat, lon, eq["lat"], eq["lon"])
#         if dist <= radius_km:
#             if tsunami_only and eq.get("tsunami") != 1:
#                 continue
#             eq_with_dist = dict(eq)
#             eq_with_dist["distance_km"] = round(dist, 2)
#             results.append(eq_with_dist)

#     return jsonify({
#         "count": len(results),
#         "earthquakes": results
#     })


# ----------------------
# Server Startup
# ----------------------

@app.route('/neo', methods=['GET'])
def get_neo_data():
    data = Ass
    return jsonify(data)

@app.route("/energy", methods=["GET"])
def asteroid_energy_route():
    id = request.args.get("id")
    ass = {}
    print(id)
    for i in Ass :
        print(i.get('id'))
        if i.get('id') == id :
            ass = i
    print(ass)
    result = estimate_asteroid_energy(ass)
    return jsonify(result)

@app.route('/population', methods=['GET'])
def get_population():
    try:
        # Get parameters from the URL query string]
        lat = float(request.args.get('lat'))
        lon = float(request.args.get('lon'))
        ind = int(request.args.get('index'))
        distance_km = float(request.args.get('distance_km', 70))  # Default to 70 km if not provided
        year = int(request.args.get('year', 2020))  # Default to 2020 if not provided

        total_population = get_total_population(lat, lon, distance_km, year)
        return jsonify({"total_population": total_population * (ind/10)}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500

# @app.route('/consequences', methods=['GET'])
# def get_consequences():
#     try:
#         # Get parameters from the URL query string]
#         lat = float(request.args.get('lat'))
#         lon = float(request.args.get('lon'))
#         ind = int(request.args.get('index'))
#         distance_km = float(request.args.get('distance_km', 70))  # Default to 70 km if not provided
#         year = int(request.args.get('year', 2020))  # Default to 2020 if not provided

#         total_population = get_total_population(lat, lon, distance_km, year)
#         return jsonify({"total_population": total_population * (ind/10)}), 200

#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400
#     except Exception as e:
#         return jsonify({"error": "An error occurred"}), 500

# @app.route('/get_impact_effects', methods=['GET'])
# def get_impact_effects_api():
#     try:
#         # Get parameters from the URL query string
#         population = request.args.get('population')

#         if population:
#             population = int(population)  # If population is passed, use it
#         elif stored_population:
#             population = stored_population  # Use stored population from API 1
#         else:
#             return jsonify({"error": "Population data is missing. Please fetch it from /get_population first."}), 400

#         kinetic_energy = float(request.args.get('kinetic_energy'))  # MegaJoules

#         # Calculate impact effects based on the provided population and kinetic energy
#         impact_details = calculate_impact_effects(kinetic_energy, population)

#         # Combine the total population and impact effects in the response
#         response = {
#             "total_population": population,
#             "impact_effects": impact_details
#         }

#         return jsonify(response), 200

#     except ValueError as e:
#         return jsonify({"error": str(e)}), 400
#     except Exception as e:
#         return jsonify({"error": "An error occurred"}), 500

# # API: Get Population and Impact Effects for multiple locations
# @app.route('/get_population_and_impact_multiple', methods=['POST'])
# def get_population_and_impact_multiple():
#     try:
#         # Get list of latitudes and longitudes from the request body
#         data = request.get_json()
        
#         if not data or not data.get("locations"):
#             return jsonify({"error": "Please provide a list of locations."}), 400

#         # Initialize the result list
#         results = []

#         # Process each location in the list
#         for location in data["locations"]:
#             lat = location["lat"]
#             lon = location["lon"]
#             year = location.get("year", 2020)  # Default to 2020 if not provided
#             kinetic_energy = location.get("kinetic_energy")

#             if not kinetic_energy:
#                 return jsonify({"error": "Kinetic energy is required for each location."}), 400

#             # Fetch population using WorldPop API with constant 70 km distance
#             total_population = get_total_population(lat, lon, DEFAULT_DISTANCE_KM, year)

#             # Calculate impact effects based on the population and kinetic energy
#             impact_details = calculate_impact_effects(kinetic_energy, total_population)

#             # Store the results for the current location
#             results.append({
#                 "lat": lat,
#                 "lon": lon,
#                 "total_population": total_population,
#                 "impact_effects": impact_details
#             })

#         # Return the results for all locations
#         return jsonify({"results": results}), 200

#     except Exception as e:
#         return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@app.route('/get_population_and_impact_multiple', methods=['POST'])
def get_population_and_impact_multiplee():
    try:
        # Get list of latitudes and longitudes from the request body
        data = request.get_json()
        
        if not data or not data.get("locations"):
            return jsonify({"error": "Please provide a list of locations."}), 400

        # Initialize the total population counter
        total_population = 0

        # Process each location in the list
        for location in data["locations"]:
            lat = location["lat"]
            lon = location["lon"]
            year = location.get("year", 2020)  # Default to 2020 if not provided

            # Get kinetic energy if provided, otherwise use the default value
            kinetic_energy = location.get("kinetic_energy", DEFAULT_KINETIC_ENERGY)

            # Fetch population using WorldPop API with constant 70 km distance
            location_population = get_total_population(lat, lon, DEFAULT_DISTANCE_KM, year)

            # Add location's population to the total population
            total_population += location_population

        # Calculate the combined impact effects based on the total population and kinetic energy
        impact_details = calculate_impact_effects(kinetic_energy, total_population)

        # Return the static output with total population and impact effects
        response = {
            "total_population": total_population,
            "impact_effects": impact_details
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


if __name__ == '__main__':
    load_earthquake_data()
    app.run(host='0.0.0.0', port=8080, debug=False)