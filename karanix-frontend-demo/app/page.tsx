'use client';

import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useOperations } from '../hooks/useOperations';
import { Operation } from '../lib/api';

const formatDateParam = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const statusColor = (status: Operation['status']) => {
  if (status === 'active') return { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee' };
  if (status === 'planned') return { bg: 'rgba(251,191,36,0.18)', color: '#fbbf24' };
  if (status === 'cancelled') return { bg: 'rgba(239,68,68,0.18)', color: '#ef4444' };
  return { bg: 'rgba(148,163,184,0.18)', color: '#cbd5e1' };
};

export default function Home() {
  const [day, setDay] = useState<'today' | 'tomorrow'>('today');
  const dateParam = day === 'today' ? formatDateParam(0) : formatDateParam(1);
  const { operations, isLoading, error } = useOperations(dateParam);
  const rows = useMemo(() => operations || [], [operations]);

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

      <section style={{ marginTop: 20 }} className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Operation list</h2>
          <div className="muted" style={{ fontSize: 13 }}>
            Showing {rows.length} item(s)
          </div>
        </div>
        {isLoading && <div style={{ marginTop: 12 }}>Loading operations…</div>}
        {error && <div style={{ marginTop: 12 }}>Failed to load operations</div>}
        {!isLoading && rows.length === 0 && <div style={{ marginTop: 12 }}>No operations scheduled.</div>}
        {!isLoading && rows.length > 0 && (
          <div style={{ marginTop: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 13 }}>
                  <th style={{ padding: '10px 6px' }}>Status</th>
                  <th style={{ padding: '10px 6px' }}>Code</th>
                  <th style={{ padding: '10px 6px' }}>Operation</th>
                  <th style={{ padding: '10px 6px' }}>Date</th>
                  <th style={{ padding: '10px 6px' }}>Manifest</th>
                  <th style={{ padding: '10px 6px' }}> </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((op) => {
                  const colors = statusColor(op.status);
                  const total = op.totalPax || op.pax.length;
                  const checked = op.checkedInCount || op.pax.filter((p) => p.checkedIn).length;
                  return (
                    <tr key={op._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 6px' }}>
                        <span className="pill" style={{ background: colors.bg, color: colors.color }}>
                          {op.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 6px', fontWeight: 600 }}>{op.code}</td>
                      <td style={{ padding: '12px 6px' }}>
                        <div style={{ fontWeight: 600 }}>{op.title}</div>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {op.tourName}
                        </div>
                      </td>
                      <td style={{ padding: '12px 6px' }}>{format(new Date(op.date), 'PP')}</td>
                      <td style={{ padding: '12px 6px' }}>
                        <div style={{ fontWeight: 600 }}>
                          {checked}/{total || '—'}
                        </div>
                        <div className="muted" style={{ fontSize: 12 }}>checked-in</div>
                      </td>
                      <td style={{ padding: '12px 6px', textAlign: 'right' }}>
                        <Link
                          href={`/operations/${op._id}`}
                          className="btn secondary"
                          aria-label={`View ${op.title}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          Details <span aria-hidden>➜</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
