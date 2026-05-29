import type { EqualizerBand } from "../../types/player";

interface EqGraphProps {
  bands: EqualizerBand[];
  className?: string;
}

export default function EqGraph({ bands, className = "" }: EqGraphProps) {
  const w = 320;
  const h = 80;
  const minG = -12;
  const maxG = 12;
  const pad = 8;

  const points = bands.map((b, i) => {
    const x = pad + (i / Math.max(bands.length - 1, 1)) * (w - pad * 2);
    const norm = (b.gain - minG) / (maxG - minG);
    const y = h - pad - norm * (h - pad * 2);
    return `${x},${y}`;
  });

  const pathD = points.length ? `M ${points.join(" L ")}` : "";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`w-full h-20 ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(236,72,153)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(168,85,247)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <line
        x1={pad}
        y1={h / 2}
        x2={w - pad}
        y2={h / 2}
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeDasharray="4 4"
      />
      {pathD && (
        <>
          <path d={`${pathD} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} fill="url(#eq-fill)" />
          <path
            d={pathD}
            fill="none"
            stroke="url(#eq-stroke)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <defs>
        <linearGradient id="eq-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {bands.map((b, i) => {
        const x = pad + (i / Math.max(bands.length - 1, 1)) * (w - pad * 2);
        const norm = (b.gain - minG) / (maxG - minG);
        const y = h - pad - norm * (h - pad * 2);
        return <circle key={b.frequency} cx={x} cy={y} r="3" fill="#ec4899" />;
      })}
    </svg>
  );
}
