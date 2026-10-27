/**
 * Converts Arabic-Indic (٠-٩) and Extended Arabic-Indic / Urdu (۰-۹)
 * digits to ASCII so users can paste numbers written in Urdu script.
 */
export function toAsciiDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= 0x0660 && code <= 0x0669) {
      out += String.fromCharCode(48 + (code - 0x0660)); // Arabic-Indic
    } else if (code >= 0x06f0 && code <= 0x06f9) {
      out += String.fromCharCode(48 + (code - 0x06f0)); // Urdu
    } else {
      out += ch;
    }
  }
  return out;
}
