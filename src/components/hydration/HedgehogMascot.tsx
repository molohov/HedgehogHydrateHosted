import Image from "next/image";
import type { EncouragementMood } from "@/lib/hydration";

type HedgehogMascotProps = {
  mood?: EncouragementMood;
  className?: string;
};

export function HedgehogMascot({
  mood = "idle",
  className = "",
}: HedgehogMascotProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/icons/hedgehog.jpg"
        alt="Hedgehog mascot"
        fill
        className="object-cover"
      />
      {mood === "goalReached" ? (
        <span className="absolute right-0 top-0 text-sm" aria-hidden="true">
          ✨
        </span>
      ) : null}
    </div>
  );
}
