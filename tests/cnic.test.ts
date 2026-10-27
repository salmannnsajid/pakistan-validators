import { describe, expect, it } from "vitest";
import { formatCNIC, isValidCNIC, parseCNIC } from "../src/cnic";

describe("parseCNIC", () => {
  it("parses a plain 13-digit CNIC", () => {
    expect(parseCNIC("3520212345671")).toEqual({
      valid: true,
      normalized: "3520212345671",
      formatted: "35202-1234567-1",
      province: "Punjab",
      gender: "male",
    });
  });

  it("accepts dashed and spaced input", () => {
    expect(parseCNIC("35202-1234567-1").valid).toBe(true);
    expect(parseCNIC("35202 1234567 1").valid).toBe(true);
  });

  it("accepts Urdu and Arabic-Indic digits", () => {
    expect(parseCNIC("۳۵۲۰۲۱۲۳۴۵۶۷۱")).toMatchObject({
      valid: true,
      formatted: "35202-1234567-1",
    });
    expect(parseCNIC("٣٥٢٠٢١٢٣٤٥٦٧١").valid).toBe(true);
  });

  it("maps region codes to provinces", () => {
    expect(parseCNIC("1730112345675")).toMatchObject({ province: "Khyber Pakhtunkhwa" });
    expect(parseCNIC("4220112345675")).toMatchObject({ province: "Sindh" });
    expect(parseCNIC("6110112345675")).toMatchObject({ province: "Islamabad" });
    expect(parseCNIC("8220312345675")).toMatchObject({ province: "Azad Jammu & Kashmir" });
  });

  it("derives gender from the last digit's parity", () => {
    expect(parseCNIC("3520212345671")).toMatchObject({ gender: "male" });
    expect(parseCNIC("3520212345672")).toMatchObject({ gender: "female" });
  });

  it("rejects wrong lengths", () => {
    expect(parseCNIC("352021234567")).toMatchObject({
      valid: false,
      reason: "expected 13 digits, got 12",
    });
    expect(parseCNIC("35202123456712").valid).toBe(false);
    expect(parseCNIC("").valid).toBe(false);
  });

  it("rejects unknown region codes and non-digits", () => {
    expect(parseCNIC("9520212345671")).toMatchObject({ valid: false });
    expect(parseCNIC("0520212345671")).toMatchObject({ valid: false });
    expect(parseCNIC("35202x1234567").valid).toBe(false);
  });
});

describe("isValidCNIC / formatCNIC", () => {
  it("round-trips", () => {
    expect(isValidCNIC("35202-1234567-1")).toBe(true);
    expect(formatCNIC("3520212345671")).toBe("35202-1234567-1");
    expect(formatCNIC("not a cnic")).toBeNull();
  });
});
