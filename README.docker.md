Docker development

This project includes two Docker setups:

- `Dockerfile` (nginx): production-oriented, serves static files on port 80.
- `Dockerfile.dev` + `docker-compose.yml`: development image using `live-server` for hot reload on port 8080.

Start (development):

```bash
# build and start the dev container
docker compose up --build
```

Open: http://localhost:8080

Start (production test):

```bash
# build static nginx image and run
docker build -t spain-portal:prod .
docker run --rm -p 80:80 spain-portal:prod
```
