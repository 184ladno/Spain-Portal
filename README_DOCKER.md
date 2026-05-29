Docker options for Spain-Portal

Overview
- The repository already includes a `Dockerfile` that serves the site using `nginx:alpine`.
- Below are recommended Docker setups and the differences between them so you can pick the right one.

Option A — Single-container static site (current `Dockerfile`)
- What: Build the repo into an `nginx` image and serve static files from `/usr/share/nginx/html`.
- How to run:
  - `docker build -t spain-portal .`
  - `docker run --rm -p 8080:80 spain-portal`
- Pros: Very small, production-like, simple to deploy to any container host.
- Cons: No API/backend; browser-only persistence (localStorage). Not convenient for iterative development (no live reload).

Option B — Compose with a mock API (`docker-compose.yml`) [recommended for testing]
- What: Two services — `web` (built from `Dockerfile`) and `api` (typicode/json-server serving `data/db.json`).
- How to run:
  - `docker compose up --build`
  - App: `http://localhost:8080`, mock API: `http://localhost:3000`
- Pros: Lets you move the in-browser DB into a lightweight API for persistence and testing. Teachers/students/itinerary can be fetched/updated via REST calls.
- Cons: Still not a production-grade backend; json-server is for prototyping only.

Option C — Dev mode with bind mounts (fast iteration)
- What: Run a simple Node-based dev server or mount the project directory into a container so you can edit locally and see changes.
- How: Use `docker-compose.override.yml` or run a container with a volume mapping the workspace into `/usr/share/nginx/html` (or run a `node` live-server). Example dev command:

```bash
docker run --rm -it -p 8080:80 -v "$PWD":/usr/share/nginx/html:ro nginx:alpine
```

- Pros: Very fast iteration, no rebuild needed for UI changes.
- Cons: Different environment than the built image; mounting as read-only prevents in-container writes if needed.

Option D — Full backend (Node/Express + DB like Postgres)
- What: Replace `json-server` with an Express API and a real DB (Postgres, SQLite). Compose runs web, api, and db services.
- Pros: Realistic persistence, access control, versioning; suitable for production testing.
- Cons: More complexity and deployment overhead.

Which should you pick?
- Prototype/demo: Option B (compose + json-server). You get an API quickly without writing backend code.
- Production static hosting: Option A (single nginx container) — simplest and smallest.
- Active development: Option C for fast iteration, optionally combined with B for API.
- Long-term product: Option D.

Next steps I can do for you
- Wire the front-end to `http://localhost:3000` json-server endpoints (GET/POST/PUT for `/students`, `/itinerary`) so edits persist to the mock API.
- Add a `docker-compose.override.yml` for development with volume mounts.
- Create a small Express backend scaffold instead of json-server.

Tell me which option you'd like me to implement (quick prototype with `json-server` or a dev-compose override, or full backend).