export const MAX_PAGE_ID = 1000;

const PAGE_ID_PATTERN = /^[1-9]\d{0,5}$/;

export function parsePageIdParam(value: string | null): number | null {
  if (value === null) {
    return 1;
  }
  if (!PAGE_ID_PATTERN.test(value)) {
    return null;
  }
  const pageId = Number(value);
  return pageId <= MAX_PAGE_ID ? pageId : null;
}
