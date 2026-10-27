import { toAsciiDigits } from "./normalize";

const PROVINCES: Record<string, string> = {
  "1": "Khyber Pakhtunkhwa",
  "2": "FATA",
  "3": "Punjab",
  "4": "Sindh",
  "5": "Balochistan",
  "6": "Islamabad",
  "7": "Gilgit-Baltistan",
  "8": "Azad Jammu & Kashmir",
};

export type ParsedCNIC =
  | {
      valid: true;
      /** 13 digits, no separators: "3520212345671" */
      normalized: string;
      /** NADRA format: "35202-1234567-1" */
      formatted: string;
      province: string;
      gender: "male" | "female";
    }
  | { valid: false; reason: string };

/**
 * Parses a CNIC in any common form: with or without dashes/spaces,
 * ASCII or Urdu digits. Province comes from the first digit and
 * gender from the parity of the last digit, per NADRA's scheme.
 */
export function parseCNIC(input: string): ParsedCNIC {
  const digits = toAsciiDigits(String(input)).replace(/[\s-]/g, "");

  if (!/^\d+$/.test(digits)) {
    return { valid: false, reason: "contains non-digit characters" };
  }
  if (digits.length !== 13) {
    return { valid: false, reason: `expected 13 digits, got ${digits.length}` };
  }

  const province = PROVINCES[digits[0]!];
  if (!province) {
    return { valid: false, reason: `unknown region code "${digits[0]}"` };
  }

  const lastDigit = Number(digits[12]);
  return {
    valid: true,
    normalized: digits,
    formatted: `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits[12]}`,
    province,
    gender: lastDigit % 2 === 1 ? "male" : "female",
  };
}

export function isValidCNIC(input: string): boolean {
  return parseCNIC(input).valid;
}

/** Returns the CNIC in NADRA format ("35202-1234567-1"), or null if invalid. */
export function formatCNIC(input: string): string | null {
  const parsed = parseCNIC(input);
  return parsed.valid ? parsed.formatted : null;
}
