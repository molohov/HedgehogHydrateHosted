type PresetStickerButtonProps = {
  label: string;
  oz: number;
  tintClass: string;
  onClick: () => void;
  disabled?: boolean;
};

export function PresetStickerButton({
  label,
  oz,
  tintClass,
  onClick,
  disabled = false,
}: PresetStickerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border-2 border-white/70 px-4 py-3 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 ${tintClass}`}
    >
      <span className="block text-sm font-semibold text-woodland">{label}</span>
      <span className="block text-xs text-woodland-muted">{oz} oz</span>
    </button>
  );
}
