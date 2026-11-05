export function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="wf-stat">
      <div className="wf-stat__icon" style={{ background: tone }}><Icon size={20} strokeWidth={2} /></div>
      <div><div className="wf-stat__value">{value}</div><div className="wf-stat__label">{label}</div></div>
    </div>
  );
}
