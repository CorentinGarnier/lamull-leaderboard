// Fond du hero : court de tennis vu de dessus (mis en perspective en CSS).
export function Court({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 400 600" fill="none" stroke="#FFD60A" strokeWidth="3" aria-hidden="true">
      <rect x="20" y="20" width="360" height="560" />
      <line x1="60" y1="20" x2="60" y2="580" />
      <line x1="340" y1="20" x2="340" y2="580" />
      <line x1="60" y1="170" x2="340" y2="170" />
      <line x1="60" y1="430" x2="340" y2="430" />
      <line x1="200" y1="170" x2="200" y2="430" />
      <line x1="20" y1="300" x2="380" y2="300" strokeWidth="6" strokeDasharray="10 8" />
      <line x1="200" y1="20" x2="200" y2="36" />
      <line x1="200" y1="564" x2="200" y2="580" />
    </svg>
  );
}