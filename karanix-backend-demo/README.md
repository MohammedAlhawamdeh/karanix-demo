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
- Two operations (today/tomorrow) with codes, start times, routes, vehicles with starting pings, pax manifests (with pickup points and seats), plus demo customers/locations.

## API contract

Base URL: `http://localhost:4000`

- `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `{ token, user: { id, name, email, role } }`

- `GET /api/operations?date=YYYY-MM-DD&status=planned|active|completed|cancelled`
  - JWT required. Lists operations for a date and optional status. Returns populated pax + vehicles and counts.
- `GET /api/operations/:id`
  - JWT required. Operation detail with pax, vehicles, stops, route.
- `POST /api/operations/:id/start` (roles: guide|driver)
  - Marks status `active`; emits `operation:start`.

- `POST /api/pax/:id/checkin` (role: guide)
  - Body:
    ```json
    {
      "method": "qr" | "manual",
      "gps": { "lat": number, "lng": number },
      "photoUrl": "optional",
      "eventId": "uuid"
    }
    ```
  - Idempotent on `eventId`. Marks pax as checked-in, updates `operations.checkedInCount`, logs a check-in event, emits `operation:manifest_update`.

- `POST /api/vehicles/:id/heartbeat` (role: driver)
  - Body: `{ lat, lng, speed?, heading?, timestamp? }` (or `{ location: { lat, lng }, ... }`)
  - Updates `lastPing` + history; emits `operation:vehicle_position` and `vehicle:position`.

- `GET /api/customers` / `POST /api/customers` (JWT)
  - Create customers and optionally attach to a location.
- `GET /api/locations` / `POST /api/locations`
  - Create locations with coordinates and attach customers (`POST /api/locations/:id/customers`).

Common errors: `401` missing/invalid token, `403` role mismatch, `400/404` invalid ids.

## WebSocket events (Socket.IO)

Namespace: default. Join a room per operation id: `operation:<id>` (and optional `vehicle:<id>`).

- `joinOperation` / `leaveOperation` with payload `<operationId>` to manage rooms.
- `joinVehicle` / `leaveVehicle` for per-vehicle rooms.
- Server emits:
  - `operation:vehicle_position`: `{ operationId, vehicle }`
  - `vehicle:position`: `{ vehicleId, vehicle }`
  - `operation:manifest_update`: `{ operationId, pax, checkedInCount }`
  - `operation:start`: `{ operationId, status: "active" }`
  - `operation:warning`: `{ operationId, message }`

## Testing

Integration tests use mongodb-memory-server.

```bash
npm test
```

Acceptance checklist:
- List operations for today/tomorrow: `GET /api/operations?date=YYYY-MM-DD`.
- Start an operation: `POST /api/operations/:id/start` with guide/driver token.
- Check-in pax: `POST /api/pax/:id/checkin` with guide token and eventId (idempotent).
- Vehicle heartbeat updates: `POST /api/vehicles/:id/heartbeat` with driver token and observe socket `operation:vehicle_position`.
- Warning rule: after start_time+15m if checked-in ratio < 70%, socket emits `operation:warning`.

## Project layout

- `src/app.ts` Express setup
- `src/server.ts` HTTP + Socket.IO bootstrap
- `src/models` Mongoose schemas (Operation, Pax, Vehicle, User, Customer, Location, CheckInEvent, OperationAlert)
- `src/routes` Routers for operations, pax, vehicles, customers, locations, auth
- `src/services` Business logic
- `src/sockets` Socket.IO init + emit helpers
- `src/seed/seed.ts` Sample data loader
- `src/tests` Supertest integration specs
