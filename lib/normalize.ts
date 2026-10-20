const ARABIC_YEH = /\u064A/g;
const ARABIC_KAF = /\u0643/g;
const ZERO_WIDTH_NON_JOINER = /\u200C/g;
const PERSIAN_DIGITS = /[\u06F0-\u06F9]/g;
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;
const WHITESPACE_RUN = /\s+/g;

const PERSIAN_ZERO = 0x06f0;
const ARABIC_INDIC_ZERO = 0x0660;
const LATIN_ZERO = 0x30;

function toLatinDigit(digit: string, zeroCodePoint: number): string {
  const value = digit.charCodeAt(0) - zeroCodePoint;
  return String.fromCharCode(LATIN_ZERO + value);
}

export function normalizePersian(value: string): string {
  return value
    .replace(ARABIC_YEH, "\u06CC")
    .replace(ARABIC_KAF, "\u06A9")
    .replace(PERSIAN_DIGITS, (digit) => toLatinDigit(digit, PERSIAN_ZERO))
    .replace(ARABIC_INDIC_DIGITS, (digit) =>
      toLatinDigit(digit, ARABIC_INDIC_ZERO),
    )
    .replace(ZERO_WIDTH_NON_JOINER, "")
    .replace(WHITESPACE_RUN, " ")
    .trim()
    .toLowerCase();
}
