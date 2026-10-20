type JsonPrimitive = string | number | boolean | null;

type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function isJsonValue(
  value: unknown,
  seen = new WeakSet<object>(),
): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value !== "object") {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item, seen));
  }

  const prototype = Object.getPrototypeOf(value);

  if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }

  return Object.values(value).every((item) => isJsonValue(item, seen));
}

function parseJsonValue(value: string): JsonValue | undefined {
  try {
    const parsed: unknown = JSON.parse(value);

    return isJsonValue(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function serializeUrlValue(value: unknown): string {
  if (!isJsonValue(value)) {
    throw new Error("URL state must contain JSON-compatible values");
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new Error("Unable to serialize URL state");
  }

  return serialized;
}

export function deserializeUrlValue<T>(
  value: string | null,
  defaultValue: T,
): T {
  if (value === null) {
    return defaultValue;
  }

  if (typeof defaultValue === "string") {
    return value as T;
  }

  if (typeof defaultValue === "number") {
    const parsed = Number(value);

    return value.trim() !== "" && Number.isFinite(parsed)
      ? (parsed as T)
      : defaultValue;
  }

  if (typeof defaultValue === "boolean") {
    if (value === "true") return true as T;
    if (value === "false") return false as T;

    return defaultValue;
  }

  if (defaultValue === null) {
    const parsed = parseJsonValue(value);

    if (
      parsed !== undefined &&
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as T;
    }

    return defaultValue;
  }

  const parsed = parseJsonValue(value);

  if (parsed === undefined) {
    return defaultValue;
  }

  if (Array.isArray(defaultValue)) {
    return Array.isArray(parsed) ? (parsed as T) : defaultValue;
  }

  if (
    typeof defaultValue === "object" &&
    defaultValue !== null &&
    typeof parsed === "object" &&
    parsed !== null &&
    !Array.isArray(parsed)
  ) {
    return parsed as T;
  }

  return defaultValue;
}
