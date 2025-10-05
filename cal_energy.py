# asteroid_energy.py

from math import pi

def spherical_volume_m3(d_km):
    radius_m = (d_km * 1000) / 2
    return (4/3) * pi * (radius_m ** 3)

def estimate_mass(diameter_km, density_kg_m3):
    volume = spherical_volume_m3(diameter_km)
    return volume * density_kg_m3

def kinetic_energy_joules(mass_kg, velocity_m_s):
    return 0.5 * mass_kg * velocity_m_s ** 2

def joules_to_megatons(joules):
    return joules / 4.184e15  # 1 MT = 4.184e15 J

def mt_to_index(mt):
    thresholds = [1e-6, 1e-4, 1e-2, 0.1, 1, 10, 100, 1_000, 10_000, 100_000]
    for i, threshold in enumerate(thresholds, 1):
        if mt <= threshold:
            return i
    return 10

def estimate_asteroid_energy(asteroid):
    # Diameter avg
    print(asteroid)
    diameters = asteroid["estimated_diameter"]["kilometers"]
    d_avg = (diameters["estimated_diameter_min"] + diameters["estimated_diameter_max"]) / 2

    # Velocity
    v_km_s = float(asteroid["close_approach_data"][0]["relative_velocity"]["kilometers_per_second"])
    v_m_s = v_km_s * 1000

    densities = {
        "low": 2000,
        "nominal": 3000,
        "high": 3500
    }

    results = {}
    for level, density in densities.items():
        mass = estimate_mass(d_avg, density)
        ke_joules = kinetic_energy_joules(mass, v_m_s)
        ke_mt = joules_to_megatons(ke_joules)
        index = mt_to_index(ke_mt)

        results[level] = {
            "density": density,
            "mass_kg": mass,
            "velocity_m_s": v_m_s,
            "kinetic_energy_joules": ke_joules,
            "kinetic_energy_megatons": ke_mt,
            "impact_index": index
        }

    results["input"] = {
        "name": asteroid.get("name", "Unknown"),
        "diameter_km_avg": d_avg,
        "velocity_km_s": v_km_s,
        "is_hazardous": asteroid.get("is_potentially_hazardous_asteroid", False)
    }

    return results
