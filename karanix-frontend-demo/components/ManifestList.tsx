'use client';

import { useState } from 'react';
import { Pax, apiFetch } from '../lib/api';

interface Props {
  pax: Pax[];
  guideToken?: string;
  onUpdate?: (pax: Pax) => void;
}

export const ManifestList = ({ pax, guideToken, onUpdate }: Props) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const sorted = [...pax].sort((a, b) => a.name.localeCompare(b.name));

  const checkIn = async (id: string) => {
    if (!guideToken) return;
    const target = pax.find((p) => p._id === id);
    const gps = target?.pickupPoint
      ? { lat: target.pickupPoint.lat, lng: target.pickupPoint.lng }
      : undefined;
    setLoadingId(id);
    try {
      const updated = await apiFetch<Pax>(`/api/pax/${id}/checkin`, {
        method: 'POST',
        token: guideToken,
        body: JSON.stringify({
          method: 'manual',
          gps,
          eventId: crypto.randomUUID()
        })
      });
      onUpdate?.(updated);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Manifest</h3>
        <div className="muted">{pax.length} pax</div>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {sorted.map((p) => (
          <div
            key={p._id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Seat {p.seatNo || '-'}
              </div>
              {p.pickupPoint && (
                <div className="muted" style={{ fontSize: 12 }}>
                  Pickup: {p.pickupPoint.address || `${p.pickupPoint.lat}, ${p.pickupPoint.lng}`}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                className="pill"
                style={{
                  background: p.checkedIn ? 'rgba(74,222,128,0.16)' : 'rgba(255,255,255,0.05)',
                  color: p.checkedIn ? '#4ade80' : '#cbd5e1'
                }}
              >
                {p.checkedIn ? 'Checked-in' : 'Pending'}
              </span>
              {!p.checkedIn && (
                <button
                  className="btn secondary"
                  onClick={() => checkIn(p._id)}
                  disabled={!guideToken || loadingId === p._id}
                >
                  {loadingId === p._id ? 'Checking in…' : 'Check-in'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
