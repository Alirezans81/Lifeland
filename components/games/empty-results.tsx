type EmptyResultsProps = {
  onReset: () => void;
};

export function EmptyResults({ onReset }: EmptyResultsProps) {
  return (
    <div className="space-y-3 rounded-md bg-surface p-6 text-center">
      <p className="text-primary">بازی‌ای با این عبارت پیدا نشد.</p>

      <button
        type="button"
        onClick={onReset}
        className="rounded-md bg-accent px-4 py-2 text-sm text-accent-foreground transition hover:opacity-90"
      >
        پاک کردن جست‌وجو
      </button>
    </div>
  );
}
