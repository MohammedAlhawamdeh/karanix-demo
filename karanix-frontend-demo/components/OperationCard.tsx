import Link from 'next/link';
import { format } from 'date-fns';
import { Operation } from '../lib/api';

const statusColor = (status: Operation['status']) => {
  if (status === 'active') return { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee' };
  if (status === 'planned') return { bg: 'rgba(251,191,36,0.18)', color: '#fbbf24' };
  return { bg: 'rgba(148,163,184,0.18)', color: '#cbd5e1' };
};

export const OperationCard = ({ op }: { op: Operation }) => {
  const colors = statusColor(op.status);
  const paxChecked = op.pax.filter((p) => p.checkedIn).length;
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="pill" style={{ background: colors.bg, color: colors.color }}>
            {op.status}
          </div>
          <h3 style={{ marginTop: 8 }}>{op.title}</h3>
          <div className="muted" style={{ marginTop: 4 }}>
            {format(new Date(op.date), 'PPPP')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{op.vehicles.length}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Vehicles
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="muted" style={{ fontSize: 14 }}>
          Manifest {paxChecked}/{op.pax.length} checked-in
        </div>
        <Link href={`/operations/${op._id}`} className="btn secondary">
          View details
        </Link>
      </div>
    </div>
  );
};
