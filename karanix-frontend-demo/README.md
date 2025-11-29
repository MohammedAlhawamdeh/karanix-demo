# Karanix Frontend (Next.js)

Next.js App Router client for viewing operations, manifests, and live vehicle updates on Google Maps. Uses SWR for data fetching and Socket.IO client for realtime updates.

## Quick start

```bash
cd karanix-frontend-demo
npm install
cp .env.example .env   # set API + Google Maps key
npm run dev            # http://localhost:3000
```

Environment:
- `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://localhost:4000`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (required to render map)
- Demo creds (used for auto-login): `NEXT_PUBLIC_GUIDE_EMAIL/PASSWORD`, `NEXT_PUBLIC_DRIVER_EMAIL/PASSWORD`

## Features

- Today/Tomorrow operations table (auth-backed) with manifest progress.
- Operation detail page:
  - Pax manifest with idempotent check-in buttons (sends `method/gps/eventId`).
  - Live map with pax pickup markers, stops, vehicle markers, and route polyline.
  - Start operation action.
  - WebSocket listeners for `operation:vehicle_position`, `operation:manifest_update`, `operation:start`, `operation:warning`.
- AuthProvider auto-logins with seed users for convenience.

## How to test against backend

1) Start backend (`npm run dev` in `karanix-backend-demo`) and seed data.
2) Ensure `.env` points to backend URL and has a valid Google Maps key.
3) Run `npm run dev` here.
4) Open `/`:
   - Toggle Today/Tomorrow to see seeded operations.
   - Click into an operation.
5) In the detail page:
   - Press **Start operation** to hit `POST /api/operations/:id/start`.
   - Click **Check-in** on a passenger to call `/api/pax/:id/checkin` (sends GPS + eventId); manifest list updates via socket.
   - Vehicle markers update on `operation:vehicle_position` (send heartbeat via backend API or driver client).

## Project layout

- `app/page.tsx` operations list
- `app/operations/[id]/page.tsx` operation detail
- `components/` UI + providers (SocketProvider, AuthProvider, MapView, ManifestList, OperationCard)
- `hooks/` SWR data hooks
- `lib/api.ts` REST helpers and types
- `lib/sockets.ts` Socket.IO client factory
