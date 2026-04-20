import { describe, expect, it } from "vitest";
import { validateDate, validateIPV6 } from "./validators";

//test the validateDate function
describe("validateDate", () => {
  it("should return a Date object for valid date strings", () => {
    expect(validateDate("31/12/2026")).toEqual(new Date(2026, 11, 31));
    expect(validateDate("1-1-2020")).toEqual(new Date(2020, 0, 1));
    expect(validateDate(" 15/08/1947 ")).toEqual(new Date(1947, 7, 15));
  });

  it("should return null for invalid date strings", () => {
    expect(validateDate("31/02/2020")).toBeNull();
    expect(validateDate("30-02-2020")).toBeNull();
    expect(validateDate("invalid date")).toBeNull();
    expect(validateDate("")).toBeNull();
    expect(validateDate("31/13/2020")).toBeNull();
    expect(validateDate("32/12/2020")).toBeNull();
  });
});

//test the validateIPV6 function
describe("validateIPV6", () => {
  it("should return true for valid IPv6 addresses", () => {
    expect(validateIPV6("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(true);
    expect(validateIPV6("2001:db8::1")).toBe(true);
    expect(validateIPV6("::1")).toBe(true);
    expect(validateIPV6("fe80::1ff:fe23:4567:890a")).toBe(true);
  });

  it("should return false for invalid IPv6 addresses", () => {
    expect(validateIPV6("2001:0db8:85a3::8a2e:0370:7334::")).toBe(false);
    expect(validateIPV6("2001:0db8:85a3:0000:0000:8a2e:0370:7334:")).toBe(false);
    expect(validateIPV6("2001:0db8:85a3:0000:0000:8a2e:0370")).toBe(false);
    expect(validateIPV6("2001:0db8:85a3::8a2e::7334")).toBe(false);
    expect(validateIPV6("invalid ipv6")).toBe(false);
    expect(validateIPV6("")).toBe(false);
  });
}); 