export function validateDate(input: string): Date | null {
  const trimmedInput = input.trim()

  // Accept French-style dates such as 31/12/2026 or 31-12-2026.
  const match = trimmedInput.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])

  if (month < 1 || month > 12) {
    return null
  }

  const candidateDate = new Date(year, month - 1, day)

  if (
    candidateDate.getFullYear() !== year ||
    candidateDate.getMonth() !== month - 1 ||
    candidateDate.getDate() !== day
  ) {
    return null
  }

  return candidateDate
}

export function validateGuid(input: string): boolean {
  const trimmedInput = input.trim()

  // Supports canonical GUIDs, optionally wrapped in braces.
  const guidPattern = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/

  return guidPattern.test(trimmedInput)
}

export function validateIPV6(input: string): boolean {
  const trimmedInput = input.trim()

  if (trimmedInput.length === 0) {
    return false
  }

  if (trimmedInput.includes(':::')) {
    return false
  }

  const doubleColonParts = trimmedInput.split('::')
  if (doubleColonParts.length > 2) {
    return false
  }

  const isValidHextet = (part: string): boolean => /^[0-9A-Fa-f]{1,4}$/.test(part)

  const leftParts = doubleColonParts[0] ? doubleColonParts[0].split(':') : []
  const rightParts =
    doubleColonParts.length === 2 && doubleColonParts[1]
      ? doubleColonParts[1].split(':')
      : []

  if (!leftParts.every(isValidHextet) || !rightParts.every(isValidHextet)) {
    return false
  }

  const totalParts = leftParts.length + rightParts.length

  // Without compression, an IPv6 address must have exactly 8 hextets.
  if (doubleColonParts.length === 1) {
    return totalParts === 8
  }

  // With compression (::), at least one hextet is omitted.
  return totalParts < 8
}
