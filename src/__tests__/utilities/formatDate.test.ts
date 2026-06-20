import { formatDate } from '../../utilities/formatDate'

describe('formatDate utility', () => {
  test('formats date correctly in UTC', () => {
    const date = new Date('2023-01-01T00:00:00Z')
    expect(formatDate(date)).toBe('01/01/2023')
  })

  test('handles date with timezone offset', () => {
    // Create a date in a timezone with offset (e.g., EST is UTC-5)
    const date = new Date('2023-01-01T00:00:00-05:00')
    // This should be equivalent to 2023-01-01T05:00:00Z
    expect(formatDate(date)).toBe('01/01/2023')
  })

  test('handles null date', () => {
    // This should throw an error
    expect(() => formatDate(new Date(NaN))).toThrow()
  })

  test('handles undefined date', () => {
    // This should throw an error
    expect(() => formatDate(undefined as any)).toThrow()
  })

  test('handles different dates', () => {
    const date1 = new Date('2023-12-25T00:00:00Z')
    expect(formatDate(date1)).toBe('12/25/2023')

    const date2 = new Date('2024-02-29T00:00:00Z')
    expect(formatDate(date2)).toBe('02/29/2024')

    const date3 = new Date('2023-07-04T00:00:00Z')
    expect(formatDate(date3)).toBe('07/04/2023')
  })

  test('handles edge case dates', () => {
    // Minimum date
    const minDate = new Date(0)
    expect(formatDate(minDate)).toBe('01/01/1970')

    // Maximum date — the largest representable Date is +275760-09-13 UTC
    const maxDate = new Date(8640000000000000)
    expect(formatDate(maxDate)).toBe('09/13/275760')
  })

  test('handles leap year correctly', () => {
    const leapYearDate = new Date('2024-02-29T00:00:00Z')
    expect(formatDate(leapYearDate)).toBe('02/29/2024')

    const nonLeapYearDate = new Date('2023-02-28T00:00:00Z')
    expect(formatDate(nonLeapYearDate)).toBe('02/28/2023')
  })

  test('handles time components correctly', () => {
    // Date with time components
    const dateWithTime = new Date('2023-06-15T14:30:00Z')
    expect(formatDate(dateWithTime)).toBe('06/15/2023')
  })

  test('handles invalid date strings', () => {
    // Invalid date string
    expect(() => formatDate(new Date('invalid-date'))).toThrow()
  })

  test('handles different locales', () => {
    // The function is hardcoded to en-US locale, so this should always return MM/DD/YYYY
    const date = new Date('2023-05-15T00:00:00Z')
    expect(formatDate(date)).toBe('05/15/2023')
  })

  test('handles dates before 1970', () => {
    // A valid pre-epoch date (the 4-digit "-1000" string is not ISO-parseable
    // and yields an Invalid Date).
    const date = new Date('1969-07-20T00:00:00Z')
    expect(formatDate(date)).toBe('07/20/1969')
  })
})