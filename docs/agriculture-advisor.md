# Agriculture Advisor

## Features
1. Browser geolocation permission flow with manual state/district fallback. GPS is only requested after the user clicks the button. Coordinates are displayed locally and are not sent to FarmDirect backend. Reverse geocoding uses OpenStreetMap Nominatim; if it is unavailable, manual location entry still works.
2. Scheme recommender filters by farmer/consumer role, crop, category and keyword, then ranks using transparent rule-based matching. It includes official portals and eligibility checks to verify.
3. Crop cultivation guide provides general steps, suitable soil, seed-selection guidance, water needs and typical duration for seven crop groups.

## Limitations
- No trained ML model or live government-scheme API is claimed.
- The eligibility list is indicative only. Final decisions, deadlines and benefits are controlled by the relevant government department and official notifications.
- Farming guidance varies by variety, district, weather and soil test; users should confirm exact practices with local agricultural experts.
