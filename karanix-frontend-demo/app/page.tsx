'use client';

import { format } from 'date-fns';
import { useState } from 'react';
import { OperationCard } from '../components/OperationCard';
import { useOperations } from '../hooks/useOperations';

const formatDateParam = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export default function Home() {
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const dateParam = day === 'today' ? formatDateParam(0) : formatDateParam(1);
  const { operations, isLoading, error } = useOperations(dateParam);

  return (
    <main className="shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="pill" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
            Control Panel
          </div>
          <h1 style={{ marginTop: 10 }}>Operations</h1>
          <div className="muted" style={{ marginTop: 6 }}>
            {format(new Date(dateParam), 'PPPP')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn secondary"
            onClick={() => setDay('today')}
            style={{ borderColor: day === 'today' ? 'var(--accent)' : 'var(--border)' }}
          >
            Today
          </button>
          <button
            className="btn secondary"
            onClick={() => setDay('tomorrow')}
            style={{ borderColor: day === 'tomorrow' ? 'var(--accent)' : 'var(--border)' }}
          >
            Tomorrow
          </button>
        </div>
      </header>

      <section style={{ marginTop: 20 }} className="grid two">
        {isLoading && <div className="card">Loading operations…</div>}
        {error && <div className="card">Failed to load operations</div>}
        {!isLoading && operations.length === 0 && (
          <div className="card">No operations scheduled.</div>
        )}
        {operations.map((op) => (
          <OperationCard key={op._id} op={op} />
        ))}
      </section>
    </main>
  );
}
