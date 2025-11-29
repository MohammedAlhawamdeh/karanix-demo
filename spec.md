# Project Specification 

## Deliverables

### 1. Backend Repository (Nest.js, MongoDB)

-   Ability to create Customers and assign multiple customers to a
    created Location, with tracking capability.
-   When a Location is created, it must be named and displayed on the
    map.
-   REST API + WebSocket (Socket.IO or ws) endpoints as listed below.
-   Basic authentication using API token or JWT.
-   DB seed script including sample operations, pax, and vehicle data.
-   README describing how to run the project, environment variables, and
    testing instructions.

### 2. Frontend Repository (Next.js + React)

-   Dashboard, Live Tracking System, Sidebar, and Header.
-   Operations list page with Today / Tomorrow filtering.
-   Operation detail page containing:
    -   Manifest (pax list)
    -   Google Maps view:
        -   Customer pickup points (markers)
        -   Vehicle live location (marker) that updates in real time
        -   Check‑in buttons (guide simulation)
-   Simple UI --- functional demo is enough, aesthetics not required.

### 3. Short Documentation

-   API contract
-   WebSocket message formats
-   Test scenarios
-   Steps validating acceptance criteria\
-   Note: Frontend should use a local Google Maps API key; instructions
    must be added to README.\
-   Backend requires no external services; positions will be sent via
    WebSocket.

------------------------------------------------------------------------

## Key Functional Requirements

### 1. Operation / Pax Data

**Operation fields:** - id, code, tour_name, date, start_time,
vehicle_id, driver_id, guide_id, - total_pax, checked_in_count, - status
(planned / active / completed / cancelled), - route (polylines or array
of coordinates), - created_at, updated_at

**Pax fields:** - pax_id, name, phone, - pickup_point { lat, lng,
address }, - seat_no, - status (waiting / checked_in / no_show), -
reservation_id, - notes

------------------------------------------------------------------------

## 2. Live GPS & Map

-   Driver device sends heartbeat periodically (e.g., every 15 seconds):
    -   `POST /api/vehicles/:id/heartbeat`
    -   Body: `{ lat, lng, heading, speed, timestamp }`
-   Backend stores the data in MongoDB (short-term last_ping +
    historical collection).
-   WebSocket channels:
    -   `vehicle:{vehicleId}`
    -   `operation:{operationId}`
-   Frontend receives real‑time location updates and smoothly animates
    vehicle marker on Google Maps.
-   Map displays both vehicle and pax pickup markers.

------------------------------------------------------------------------

## 3. Today / Tomorrow Filtering (Active Operations)

-   Endpoint:
    -   `GET /api/operations?date=YYYY-MM-DD&status=active|planned`
-   Operation start:
    -   `POST /api/operations/:id/start`
    -   Updates status to "active"
    -   WebSocket broadcast to OpsManager, guide, driver

------------------------------------------------------------------------

## 4. Check‑in Workflow (Guide)

-   Guide triggers:
    -   `POST /api/pax/:id/checkin`

    -   Body:

        ``` json
        {
          "method": "qr" | "manual",
          "gps": { "lat": number, "lng": number },
          "photoUrl": "optional"
        }
        ```
-   Server responsibilities:
    -   Update `pax.status = checked_in`
    -   Increment `operations.checked_in_count`
    -   Create event log
    -   Publish manifest update on WebSocket channel
-   Offline synchronization requirement:
    -   Each check‑in must have a UUID eventId
    -   Server must enforce idempotency

------------------------------------------------------------------------

## 5. Notification / Warning Rule

-   If:
    -   `start_time + 15 minutes` passed\
    -   AND `checked_in_count / total_pax < 0.7`\
-   Backend must send a warning event to the operations manager (via API
    token), using WebSocket + log.
-   For the demo, polling or basic test script is acceptable.

------------------------------------------------------------------------

# Acceptance Criteria (Testable)

1.  Backend running with:

        npm install
        npm run start

2.  `GET /api/operations?date=` returns today/tomorrow's operations.

3.  When a driver heartbeat is sent:

    -   Data is saved to DB
    -   WebSocket publishes `operation:{id}:vehicle_position`
    -   Frontend shows vehicle marker with updated position

4.  When the guide performs check‑in:

    -   Pax.status updates
    -   operations.checked_in_count increments
    -   WebSocket publishes manifest update

5.  Demo Frontend:

    -   Displays pax pickup markers
    -   Displays real‑time vehicle marker

6.  README includes clear test instructions, seed and test scripts.
