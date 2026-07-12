# Modular Form Creator

Frontend for a resources management workflow: create resources, fill in the Basic Info and Project Details modules, provision a resource to completed and review everything in a summary view. Built with React 19, TypeScript, React Router 7 data APIs and styled-components on Vite.

## Quick start (full stack in Docker)

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001 (Swagger UI at http://localhost:5001/docs)

## Local development

Run the backend and database in Docker, the frontend on the host:

```bash
docker compose up -d backend mongo
npm install
npm run dev
```

The dev server proxies `/api/*` to the backend. The target comes from `VITE_API_URL` and defaults to `http://localhost:5001`.

## Scripts

```bash
npm run dev      # start the Vite dev server
npm test         # run the unit test suite (vitest, jsdom)
npm run check    # lint, typecheck, prettier and unit tests
npm run build    # production build
```

## Routes

- `/resources` - list with filtering, sorting, pagination, create and delete
- `/resources/:resourceId` - overview with module progress, provisioning and delete
- `/resources/:resourceId/details` - read-only summary of both modules
- `/resources/:resourceId/basic-info` - Basic Info module form
- `/resources/:resourceId/project-details` - Project Details module form

## How it works

- Data fetching uses React Router data APIs: route loaders for reads, route actions and fetchers for mutations. All API calls live in `src/api/`.
- Draft resources: modules are saved individually through their PATCH endpoints. Project Details unlocks once Basic Info is complete. Provisioning is the only transition from draft to completed and requires both modules to be complete.
- Completed resources: form edits are buffered in frontend memory (state on the resource route, shared with the module forms through outlet context). Nothing is sent to the backend until the user explicitly submits, which persists all buffered changes in a single full update request. The buffer is intentionally lost on refresh or close.

## Project constraints

- `src/design-system/` is read-only and its component set is fixed.
- The backend is an external service with a fixed contract, documented in `backend/README.md`.

## Why this project exists

It was a project for a coding challenge for a Frontend Developer position. The goal was to build a frontend that works with a given backend API, using React Router data APIs and a fixed design system, while following best practices for code organization, testing, and state management.

## What would be added in production

- **Frontend form validation**: extra validation would be added with **react-hook-form** and **yup** schema validation for client-side field-level errors before submission.
- **Per-field API errors**: validation errors returned by the API for a specific field would be displayed inline next to that field, not as a generic error banner.

Dominik Gronkiewicz
[dominikgronkiewicz.com](https://dominikgronkiewicz.com/)
