# Karanix Backend (Express + MongoDB + Socket.IO)

Express API with MongoDB + Mongoose for operations, vehicles, and pax manifests. Includes JWT auth (guide/driver roles), Socket.IO for real-time vehicle and manifest events, and a seed script with sample data.

## Quick start

```bash
cd karanix-backend-demo
cp .env.example .env   # update if needed
npm install
npm run seed           # populate dev data
npm run dev            # starts on http://localhost:4000
```

## Environment

- `PORT` (default 4000)
- `MONGO_URI` MongoDB connection (`mongodb://127.0.0.1:27017/karanix_demo`)
- `JWT_SECRET` / `JWT_EXPIRY`
- `CLIENT_ORIGIN` CORS origin (use frontend origin)

## Seed data

`npm run seed` resets collections and loads:
- Guide user: `guide@example.com` / `guide123`
- Driver user: `driver@example.com` / `driver123`
- Two operations (today/tomorrow), vehicles with starting pings, and pax manifests.

## API contract

Base URL: `http://localhost:4000`

- `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `{ token, user: { id, name, email, role } }`

- `GET /api/operations?date=YYYY-MM-DD&status=planned|active|completed`
  - Lists operations for a date and optional status. Returns populated pax + vehicles.
- `GET /api/operations/:id`
  - Operation detail with pax, vehicles, stops.
- `POST /api/operations/:id/start` (roles: guide|driver)
  - Marks status `active`; emits `operation:start`.

- `POST /api/pax/:id/checkin` (role: guide)
  - Marks pax as checked-in; emits `manifest:update`.

- `POST /api/vehicles/:id/heartbeat` (role: driver)
  - Body: `{ location: { lat, lng }, speed? }`
  - Updates `lastPing` + history; emits `vehicle:update`.

Common errors: `401` missing/invalid token, `403` role mismatch, `400/404` invalid ids.

## WebSocket events (Socket.IO)

Namespace: default. Join a room per operation id: `operation:<id>`.

- `joinOperation` / `leaveOperation` with payload `<operationId>` to manage rooms.
- Server emits:
  - `vehicle:update`: `{ operationId, vehicle }`
  - `manifest:update`: `{ operationId, pax }`
  - `operation:start`: `{ operationId, status: "active" }`

## Testing

Integration tests use mongodb-memory-server.

```bash
npm test
```

Acceptance checklist:
- List operations for today/tomorrow: `GET /api/operations?date=YYYY-MM-DD`.
- Start an operation: `POST /api/operations/:id/start` with guide/driver token.
- Check-in pax: `POST /api/pax/:id/checkin` with guide token.
- Vehicle heartbeat updates: `POST /api/vehicles/:id/heartbeat` with driver token and observe socket `vehicle:update`.

## Project layout

- `src/app.ts` Express setup
- `src/server.ts` HTTP + Socket.IO bootstrap
- `src/models` Mongoose schemas (Operation, Pax, Vehicle, User)
- `src/routes` Routers for operations, pax, vehicles, auth
- `src/services` Business logic
- `src/sockets` Socket.IO init + emit helpers
- `src/seed/seed.ts` Sample data loader
- `src/tests` Supertest integration specs
