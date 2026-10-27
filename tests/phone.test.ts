import { describe, expect, it } from "vitest";
import { formatPhone, isValidPhone, parsePhone } from "../src/phone";

describe("parsePhone", () => {
  it("parses a local number", () => {
    expect(parsePhone("03001234567")).toEqual({
      valid: true,
      e164: "+923001234567",
      local: "0300-1234567",
      international: "+92 300 1234567",
      prefix: "300",
    });
  });

  it("normalizes every common input shape to the same number", () => {
    const expected = "+923001234567";
    for (const input of [
      "0300-1234567",
      "0300 1234567",
      "(0300) 1234567",
      "+923001234567",
      "+92 300 1234567",
      "923001234567",
      "00923001234567",
      "3001234567",
    ]) {
      const parsed = parsePhone(input);
      expect(parsed.valid, input).toBe(true);
      if (parsed.valid) expect(parsed.e164, input).toBe(expected);
    }
  });

  it("accepts Urdu digits", () => {
    expect(parsePhone("۰۳۰۰۱۲۳۴۵۶۷")).toMatchObject({ e164: "+923001234567" });
  });

  it("accepts all assigned prefixes including SCOM", () => {
    expect(isValidPhone("03451234567")).toBe(true); // Telenor range
    expect(isValidPhone("03551234567")).toBe(true); // SCOM
  });

  it("rejects unassigned prefixes", () => {
    expect(parsePhone("03601234567")).toMatchObject({
      valid: false,
      reason: 'unassigned mobile prefix "0360"',
    });
    expect(isValidPhone("03991234567")).toBe(false);
  });

  it("rejects landlines, wrong lengths, and garbage", () => {
    expect(isValidPhone("0421234567")).toBe(false); // Lahore landline
    expect(isValidPhone("0300123456")).toBe(false); // too short
    expect(isValidPhone("030012345678")).toBe(false); // too long
    expect(isValidPhone("hello")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

describe("formatPhone", () => {
  it("formats in each style", () => {
    expect(formatPhone("+923001234567")).toBe("0300-1234567");
    expect(formatPhone("03001234567", "international")).toBe("+92 300 1234567");
    expect(formatPhone("0300-1234567", "e164")).toBe("+923001234567");
    expect(formatPhone("invalid")).toBeNull();
  });
});
