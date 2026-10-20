export const IMAGE_BASE_URL = "https://dl.lifelands.ir/";

const ABSOLUTE_HTTP_PATTERN = /^https?:\/\//i;
const ANY_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export function resolveImageUrl(path: string): string | null {
  const trimmed = path.trim();
  if (trimmed === "") {
    return null;
  }
  if (ABSOLUTE_HTTP_PATTERN.test(trimmed)) {
    return trimmed;
  }
  if (ANY_SCHEME_PATTERN.test(trimmed)) {
    return null;
  }

  const segments = trimmed.split("/").filter((segment) => segment !== "");
  if (segments.length === 0 || segments.includes("..")) {
    return null;
  }
  return IMAGE_BASE_URL + segments.map(encodeURIComponent).join("/");
}
