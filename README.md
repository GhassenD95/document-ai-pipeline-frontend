# Document AI Pipeline — Frontend

React + TypeScript frontend for the Document AI Pipeline. Dashboard with real-time status polling, drag-and-drop upload, full-text search, and a detail view showing raw OCR text alongside LLM-extracted fields.

Part of a full-stack portfolio project: upload PDF invoices → Tesseract OCR → Groq LLM extraction → structured data.

## Quick Start

```bash
npm install
npm run dev
```

Requires the backend at `http://localhost:8081` (configurable via `VITE_API_BASE_URL`).

## Build

```bash
npm run build   # output in dist/
```

## Docker

```bash
docker build -t docai-frontend --build-arg VITE_API_BASE_URL="" .
docker run -p 5173:80 docai-frontend
```

The Nginx config proxies `/api` to the backend container.

## Tech Stack

- React 19, TypeScript, Vite
- Tailwind CSS v4 (Stitch design tokens)
- React Router v7
- TanStack Query (auto-refetch, mutations)

<img width="1917" height="893" alt="Screenshot from 2026-06-15 19-58-16" src="https://github.com/user-attachments/assets/a3a81e57-8cc0-4bdf-8d36-6d7372a554bf" />

<img width="1917" height="893" alt="Screenshot from 2026-06-15 19-58-38" src="https://github.com/user-attachments/assets/feb30708-9dbf-4fbd-a20d-e6a483def5d2" />

