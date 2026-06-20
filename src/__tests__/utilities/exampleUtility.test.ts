import { formatDate } from '/Users/charl/Desktop/GIT/codelens/src/utilities/formatDate'
import { test, expect } from 'vitest'

test('formats date correctly', () => {
  const date = new Date('2023-01-01')
  expect(formatDate(date)).toBe('01/01/2023')
})