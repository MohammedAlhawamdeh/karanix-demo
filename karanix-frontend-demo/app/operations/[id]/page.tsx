'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ManifestList } from '../../../components/ManifestList';
import { MapView } from '../../../components/MapView';
import { useOperationDetail } from '../../../hooks/useOperationDetail';
import { useAuth } from '../../../components/AuthProvider';
import { apiFetch, Operation, Pax, Vehicle } from '../../../lib/api';
import { useSocket } from '../../../components/SocketProvider';

export default function OperationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { operation, isLoading, refresh } = useOperationDetail(id);
  const { guide, driver, loading: authLoading, error: authError } = useAuth();
  const [pax, setPax] = useState<Pax[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<Operation['status']>('planned');
  const [sendingHeartbeat, setSendingHeartbeat] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (operation) {
      setPax(operation.pax || []);
      setVehicles(operation.vehicles || []);
      setStatus(operation.status);
    }
  }, [operation]);

  useEffect(() => {
    if (!socket || !id) return;
    socket.emit('joinOperation', id);

    const handleVehicle = (payload: { vehicle: Vehicle }) => {
      setVehicles((prev) => {
        const others = prev.filter((v) => v._id !== payload.vehicle._id);
        return [...others, payload.vehicle];
      });
    };

    const handleManifest = (payload: { pax: Pax }) => {
      setPax((prev) => {
        const others = prev.filter((p) => p._id !== payload.pax._id);
        return [...others, payload.pax];
      });
    };

    const handleStart = () => setStatus('active');

    socket.on('vehicle:update', handleVehicle);
    socket.on('manifest:update', handleManifest);
    socket.on('operation:start', handleStart);

    return () => {
      socket.emit('leaveOperation', id);
      socket.off('vehicle:update', handleVehicle);
      socket.off('manifest:update', handleManifest);
      socket.off('operation:start', handleStart);
    };
  }, [socket, id]);

  const startOperation = async () => {
    if (!guide?.token) return;
    await apiFetch(`/api/operations/${id}/start`, {
      method: 'POST',
      token: guide.token
    });
    setStatus('active');
    refresh();
  };

  const sendHeartbeat = async () => {
    if (!driver?.token || vehicles.length === 0 || !operation) return;
    const vessel = vehicles[0];

    const base =
      vessel.lastPing?.location ||
      operation.stops[0]?.location || { lat: 40.75, lng: -73.99 };

    // Nudge the marker a bit for visual movement.
    const nextLat = base.lat + (Math.random() - 0.5) * 0.01;
    const nextLng = base.lng + (Math.random() - 0.5) * 0.01;

    setSendingHeartbeat(true);
    try {
      const updated = await apiFetch<Vehicle>(`/api/vehicles/${vessel._id}/heartbeat`, {
        method: 'POST',
        token: driver.token,
        body: JSON.stringify({
          location: { lat: nextLat, lng: nextLng },
          speed: Math.floor(15 + Math.random() * 20)
        })
      });
      setVehicles((prev) => {
        const others = prev.filter((v) => v._id !== updated._id);
        return [...others, updated];
      });
    } finally {
      setSendingHeartbeat(false);
    }
  };

  const checkedInCount = useMemo(() => pax.filter((p) => p.checkedIn).length, [pax]);

  if (isLoading || !operation) {
    return (
      <main className="shell">
        <div className="card">Loading operation…</div>
      </main>
    );
  }

  return (
    <main className="shell" style={{ display: 'grid', gap: 16 }}>
      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="pill" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
              Operation
            </div>
            <h1 style={{ marginTop: 6 }}>{operation.title}</h1>
            <div className="muted">{format(new Date(operation.date), 'PPPP')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="pill" style={{ background: 'rgba(251,191,36,0.16)', color: '#fbbf24' }}>
              {status}
            </div>
            <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12 }}>
              {checkedInCount}/{pax.length} checked-in
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={startOperation} disabled={!guide?.token || status === 'active'}>
            Start operation
          </button>
          <button
            className="btn secondary"
            onClick={sendHeartbeat}
            disabled={!driver?.token || vehicles.length === 0 || sendingHeartbeat}
            title={driver?.token ? 'Simulate driver ping' : 'Driver auto-login still loading'}
          >
            {sendingHeartbeat ? 'Pinging…' : 'Send heartbeat'}
          </button>
          {authLoading && <span className="muted">Signing in guide/driver…</span>}
          {authError && <span className="muted">Auth error: {authError}</span>}
        </div>
        {operation.notes && (
          <div className="muted" style={{ marginTop: 4 }}>
            {operation.notes}
          </div>
        )}
      </div>

      <div className="grid two">
        <ManifestList
          pax={pax}
          guideToken={guide?.token}
          onUpdate={(updated) => {
            setPax((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
          }}
        />
        <div className="card">
          <h3>Stops</h3>
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {operation.stops.map((stop, idx) => (
              <div
                key={stop.name}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {idx + 1}. {stop.name}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {stop.location.lat.toFixed(3)}, {stop.location.lng.toFixed(3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MapView operation={operation} vehicles={vehicles} />
    </main>
  );
}
