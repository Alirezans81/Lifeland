export const VENDORS = ["rubika", "soroush"] as const;

export type Vendor = (typeof VENDORS)[number];

export function isVendor(value: string): value is Vendor {
  return VENDORS.some((vendor) => vendor === value);
}
