// Художественные элементы без внешних файлов: зиккурат в золотых тонах.

const TIERS: [number, number, number, number][] = [
  [10, 96, 180, 16],
  [30, 80, 140, 16],
  [50, 64, 100, 16],
  [68, 48, 64, 16],
  [82, 34, 36, 14],
  [92, 22, 16, 12],
];

const STEPS = Array.from({ length: 14 }, (_, i) => 28 + i * 6);

export function Ziggurat({ className = "", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 200 120" className={className} role="img" aria-label="Зиккурат" fill="none">
      <defs>
        <linearGradient id="zg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F0C66A" />
          <stop offset="1" stopColor="#8E5E1C" />
        </linearGradient>
        <radialGradient id="zs" cx="50%" cy="35%" r="60%">
          <stop offset="0" stopColor="#FFD98A" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && <circle cx="100" cy="46" r="78" fill="url(#zs)" />}
      {TIERS.map(([x, y, w, h]) => (
        <rect key={y} x={x} y={y} width={w} height={h} rx="1.5" fill="url(#zg)" stroke="#5d3a0e" strokeWidth="0.8" />
      ))}
      <path d="M91 112 L109 112 L103.5 22 L96.5 22 Z" fill="#2a1a08" opacity="0.55" />
      {STEPS.map((y) => {
        const hw = 3 + ((y - 22) * 5) / 90;
        return <line key={y} x1={100 - hw} x2={100 + hw} y1={y} y2={y} stroke="#F0C66A" strokeOpacity="0.45" strokeWidth="0.7" />;
      })}
      <rect x="6" y="112" width="188" height="2" fill="#F0C66A" opacity="0.35" />
    </svg>
  );
}

// Линейный зиккурат для логотипа в боковом меню (контур, как в макете).
export function ZigLine({ className = "" }: { className?: string }) {
  const stairs = [10, 14, 18, 22, 26, 30, 34, 38, 42];
  return (
    <svg viewBox="0 0 70 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 46h66" />
      <path d="M7 46V36h56v10" />
      <path d="M13 36V26h44v10" />
      <path d="M19 26V16h32v10" />
      <path d="M25 16V8h20v8" />
      <path d="M31 8V3h8v5" />
      <path d="M35 3V0.5" />
      <path d="M31.5 46L32 8M38.5 46L38 8" />
      {stairs.map((y) => (
        <path key={y} d={`M31.6 ${y}h6.8`} strokeWidth="1" />
      ))}
      <path d="M23 21h5M42 21h5M17 31h5M48 31h5M11 41h5M54 41h5" strokeWidth="1" />
    </svg>
  );
}
