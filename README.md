# Document AI Pipeline — Frontend

React + TypeScript + Vite + Tailwind CSS v4 frontend for the Document AI Pipeline.

## Quick Start

```bash
npm install
npm run dev
```

Requires the backend running at `http://localhost:8081` (configurable via `VITE_API_BASE_URL`).

## Build for Production

```bash
npm run build
# Output in dist/
```

## Docker

```bash
docker build -t docai-frontend --build-arg VITE_API_BASE_URL="" .
docker run -p 5173:80 docai-frontend
```

The Nginx config proxies `/api` requests to the backend container (named `backend` in the compose network).
