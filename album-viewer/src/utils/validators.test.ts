import { describe, expect, it } from 'vitest'
import { validateDate, validateGuid, validateIPV6, validatePhoneNumber } from './validators'

describe('validateDate', () => {
  describe('valid date strings', () => {
    it('should return a Date for a valid slash-delimited date', () => {
      expect(validateDate('31/12/2026')).toEqual(new Date(2026, 11, 31))
    })

    it('should return a Date for a valid dash-delimited date', () => {
      expect(validateDate('1-1-2020')).toEqual(new Date(2020, 0, 1))
    })

    it('should return a Date for a valid leap-year date', () => {
      expect(validateDate('29/02/2024')).toEqual(new Date(2024, 1, 29))
    })

    it('should return a Date for a valid trimmed date string', () => {
      expect(validateDate(' 15/08/1947 ')).toEqual(new Date(1947, 7, 15))
    })
  })

  describe('invalid date strings', () => {
    it('should return null for impossible calendar dates', () => {
      expect(validateDate('31/02/2020')).toBeNull()
    })

    it('should return null for day zero', () => {
      expect(validateDate('00/12/2020')).toBeNull()
    })

    it('should return null for invalid months', () => {
      expect(validateDate('31/13/2020')).toBeNull()
    })

    it('should return null for malformed input', () => {
      expect(validateDate('invalid date')).toBeNull()
    })

    it('should return null for an empty string', () => {
      expect(validateDate('')).toBeNull()
    })
  })
})

describe('validateGuid', () => {
  describe('valid GUID strings', () => {
    it('should return true for a canonical lowercase GUID', () => {
      expect(validateGuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })

    it('should return true for a canonical uppercase GUID', () => {
      expect(validateGuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('should return true for a GUID wrapped in braces', () => {
      expect(validateGuid('{550e8400-e29b-41d4-a716-446655440000}')).toBe(true)
    })

    it('should return true for a trimmed GUID', () => {
      expect(validateGuid(' 550e8400-e29b-41d4-a716-446655440000 ')).toBe(true)
    })
  })

  describe('invalid GUID strings', () => {
    it('should return false when a GUID is too short', () => {
      expect(validateGuid('550e8400-e29b-41d4-a716-44665544000')).toBe(false)
    })

    it('should return false when a GUID has unmatched braces', () => {
      expect(validateGuid('{550e8400-e29b-41d4-a716-446655440000')).toBe(false)
    })

    it('should return false when separators are missing', () => {
      expect(validateGuid('550e8400e29b41d4a716446655440000')).toBe(false)
    })

    it('should return false when characters are not hexadecimal', () => {
      expect(validateGuid('550e8400-e29b-41d4-a716-44665544ZZZZ')).toBe(false)
    })

    it('should return false for an empty GUID', () => {
      expect(validateGuid('')).toBe(false)
    })
  })
})

describe('validatePhoneNumber', () => {
  describe('valid phone numbers', () => {
    it('should return true if the phone number is a valid international number', () => {
      expect(validatePhoneNumber('+33606060606')).toBe(true)
    })

    it('should return true for a local american number with parentheses', () => {
      expect(validatePhoneNumber('(202) 939-9889')).toBe(true)
    })

    it('should return true if the phone number is a valid local american number', () => {
      expect(validatePhoneNumber('202-939-9889')).toBe(true)
    })

    it('should return true for an international number with spaces', () => {
      expect(validatePhoneNumber('+1 202 555 0187')).toBe(true)
    })

    it('should return true for an international number using the 00 prefix', () => {
      expect(validatePhoneNumber('0033123456789')).toBe(true)
    })
  })

  describe('invalid phone numbers', () => {
    it('should throw an error if the given phone number is empty', () => {
      expect(() => validatePhoneNumber('')).toThrow()
    })

    it('should throw an error if the phone number only contains whitespace', () => {
      expect(() => validatePhoneNumber('   ')).toThrow('Phone number cannot be empty')
    })

    it('should return false for an international number that is too short', () => {
      expect(validatePhoneNumber('+33')).toBe(false)
    })

    it('should return false for malformed phone numbers with repeated plus signs', () => {
      expect(validatePhoneNumber('++33606060606')).toBe(false)
    })

    it('should return false for phone numbers containing letters', () => {
      expect(validatePhoneNumber('+33ABCDEF')).toBe(false)
    })
  })
})

describe('validateIPV6', () => {
  describe('valid IPv6 addresses', () => {
    it('should return true for a full IPv6 address', () => {
      expect(validateIPV6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true)
    })

    it('should return true for the unspecified IPv6 address', () => {
      expect(validateIPV6('::')).toBe(true)
    })

    it('should return true for a compressed IPv6 address', () => {
      expect(validateIPV6('2001:db8::1')).toBe(true)
    })

    it('should return true for the loopback IPv6 address', () => {
      expect(validateIPV6('::1')).toBe(true)
    })

    it('should return true for a link-local IPv6 address', () => {
      expect(validateIPV6('fe80::1ff:fe23:4567:890a')).toBe(true)
    })
  })

  describe('invalid IPv6 addresses', () => {
    it('should return false for multiple compression operators', () => {
      expect(validateIPV6('2001:0db8:85a3::8a2e:0370:7334::')).toBe(false)
    })

    it('should return false for a trailing colon without compression', () => {
      expect(validateIPV6('2001:0db8:85a3:0000:0000:8a2e:0370:7334:')).toBe(false)
    })

    it('should return false for too few hextets without compression', () => {
      expect(validateIPV6('2001:0db8:85a3:0000:0000:8a2e:0370')).toBe(false)
    })

    it('should return false for invalid characters', () => {
      expect(validateIPV6('invalid ipv6')).toBe(false)
    })

    it('should return false for an empty IPv6 string', () => {
      expect(validateIPV6('')).toBe(false)
    })
  })
})