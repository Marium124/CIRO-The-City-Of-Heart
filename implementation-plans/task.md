# Task Checklist - CIRO Submission Optimization

- `[x]` Purge test/simulation rows safely from SQLite database using [clear_database.py](file:///c:/ciro/backend/scripts/clear_database.py).
- `[x]` Center and zoom Map Screen dynamically to a local neighborhood delta `0.03` scale on load.
- `[x]` Return active dispatch records alongside crisis objects in `/api/crises/active` API response.
- `[x]` Display real-time dispatch cards on the mobile Crises Details layout.
- `[x]` Resolve HTTP 500 NameError in signals endpoint.
- `[x]` Rewrite CSV Exporter to run dependency-free without `pandas`.
- `[x]` Overhaul multi-signal fusion inside `signals.py` to auto-synthesize concurrent weather and traffic logs.
- `[x]` Deploy constrained global `ResourceManager` inventory pool.
- `[x]` Integrate deterministic modeling and unintended congestion side-effects in `SimulationAgent`.
- `[x]` Custom-tailor role SMS alert messages for hospitals, utility grids, transit, and public.
- `[ ]` Run multi-city scenario validation tests to verify CSV telemetry outputs.
