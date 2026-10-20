const countFormatter = new Intl.NumberFormat("fa-IR");

export function formatResultCount(count: number): string {
  if (count === 0) {
    return "بازی‌ای پیدا نشد";
  }
  if (count === 1) {
    return "یک بازی پیدا شد";
  }
  return `${countFormatter.format(count)} بازی پیدا شد`;
}
