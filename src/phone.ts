import { toAsciiDigits } from "./normalize";

// Assigned Pakistani mobile prefixes: 300-349 (Jazz, Zong, Ufone,
// Telenor and former Warid ranges) plus 355 (SCOM). Carrier is not
// reported: number portability makes prefix-based lookup unreliable.
const PREFIX_RE = /^(3[0-4]\d|355)/;

export type PhoneStyle = "local" | "international" | "e164";

export type ParsedPhone =
  | {
      valid: true;
      /** "+923001234567" */
      e164: string;
      /** "0300-1234567" */
      local: string;
      /** "+92 300 1234567" */
      international: string;
      /** First three digits of the subscriber number: "300" */
      prefix: string;
    }
  | { valid: false; reason: string };

/**
 * Parses a Pakistani mobile number in any common form:
 * "03001234567", "0300-1234567", "+92 300 1234567", "923001234567",
 * "00923001234567" — ASCII or Urdu digits.
 *
 * @example
 * parsePhone("+92 300 1234567");
 * // { valid: true, e164: "+923001234567", local: "0300-1234567",
 * //   international: "+92 300 1234567", prefix: "300" }
 */
export function parsePhone(input: string): ParsedPhone {
  let s = toAsciiDigits(String(input)).replace(/[\s\-().]/g, "");

  if (s.startsWith("+")) s = s.slice(1);
  if (!/^\d+$/.test(s)) {
    return { valid: false, reason: "contains non-digit characters" };
  }

  // Reduce to the 10-digit national number ("3001234567").
  if (s.startsWith("0092")) s = s.slice(4);
  else if (s.startsWith("92") && s.length === 12) s = s.slice(2);
  else if (s.startsWith("0")) s = s.slice(1);

  if (s.length !== 10 || !s.startsWith("3")) {
    return { valid: false, reason: "not a Pakistani mobile number" };
  }
  if (!PREFIX_RE.test(s)) {
    return { valid: false, reason: `unassigned mobile prefix "0${s.slice(0, 3)}"` };
  }

  const prefix = s.slice(0, 3);
  const subscriber = s.slice(3);
  return {
    valid: true,
    e164: `+92${s}`,
    local: `0${prefix}-${subscriber}`,
    international: `+92 ${prefix} ${subscriber}`,
    prefix,
  };
}

/**
 * Checks whether the input is a valid Pakistani mobile number,
 * in any common form ("03001234567", "+923001234567", ...).
 *
 * @example
 * isValidPhone("0300-1234567");  // true
 * isValidPhone("+923001234567"); // true
 * isValidPhone("0399-1234567");  // false (unassigned prefix)
 */
export function isValidPhone(input: string): boolean {
  return parsePhone(input).valid;
}

/**
 * Returns the number in the given style (default "local"), or null if invalid.
 *
 * @example
 * formatPhone("03001234567", "e164");          // "+923001234567"
 * formatPhone("00923001234567");               // "0300-1234567"
 * formatPhone("03001234567", "international"); // "+92 300 1234567"
 */
export function formatPhone(input: string, style: PhoneStyle = "local"): string | null {
  const parsed = parsePhone(input);
  if (!parsed.valid) return null;
  return style === "e164" ? parsed.e164 : parsed[style];
}
