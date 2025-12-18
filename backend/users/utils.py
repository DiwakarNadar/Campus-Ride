import math

def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Returns distance in kilometers between two (lat, lng) points using Haversine formula.
    """
    R = 6371  # Earth radius in KM

    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    return R * c
