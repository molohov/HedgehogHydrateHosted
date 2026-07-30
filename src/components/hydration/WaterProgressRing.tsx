type WaterProgressRingProps = {
  percent: number;
  todayOz: number;
  goalOz: number;
};

export function WaterProgressRing({
  percent,
  todayOz,
  goalOz,
}: WaterProgressRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#EDE3D2"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#7EC8E3"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-woodland">{todayOz}</span>
        <span className="text-sm text-woodland-muted">/ {goalOz} oz</span>
        <span className="mt-1 text-lg font-semibold text-water-deep">
          {percent}%
        </span>
      </div>
    </div>
  );
}
