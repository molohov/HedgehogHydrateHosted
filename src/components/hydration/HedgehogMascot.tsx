import type { EncouragementMood } from "@/lib/hydration";

type HedgehogMascotProps = {
  mood?: EncouragementMood;
  className?: string;
};

export function HedgehogMascot({
  mood = "idle",
  className = "",
}: HedgehogMascotProps) {
  const eyeScale = mood === "happySip" || mood === "goalReached" ? 1.15 : 1;
  const smilePath =
    mood === "goalReached"
      ? "M 34 58 Q 50 68 66 58"
      : mood === "happySip"
        ? "M 36 57 Q 50 64 64 57"
        : "M 38 58 Q 50 62 62 58";

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Hedgehog mascot"
      className={className}
    >
      <ellipse cx="50" cy="58" rx="30" ry="24" fill="#8B5E3C" />
      <g fill="#6B4423">
        {Array.from({ length: 9 }).map((_, index) => {
          const angle = -70 + index * 17.5;
          const radians = (angle * Math.PI) / 180;
          const x1 = 50 + Math.cos(radians) * 18;
          const y1 = 40 + Math.sin(radians) * 18;
          const x2 = 50 + Math.cos(radians) * 34;
          const y2 = 34 + Math.sin(radians) * 34;
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#6B4423"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx="50" cy="62" r="18" fill="#F4B08A" />
      <circle cx="42" cy="58" r={3 * eyeScale} fill="#3E3228" />
      <circle cx="58" cy="58" r={3 * eyeScale} fill="#3E3228" />
      <circle cx="50" cy="64" r="2.2" fill="#6B4423" />
      <path d={smilePath} fill="none" stroke="#6B4423" strokeWidth="2" strokeLinecap="round" />
      {mood === "goalReached" ? (
        <text x="72" y="28" fontSize="14">
          ✨
        </text>
      ) : null}
    </svg>
  );
}
