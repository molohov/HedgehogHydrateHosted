type EncouragementBubbleProps = {
  message: string;
};

export function EncouragementBubble({ message }: EncouragementBubbleProps) {
  return (
    <div className="rounded-2xl border border-moss/20 bg-soft-cream/95 px-4 py-3 text-center shadow-sm">
      <p className="text-sm font-medium text-moss-dark">{message}</p>
    </div>
  );
}
