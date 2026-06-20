import { formatDate } from '@/utilities/formatDate'
test('formats date correctly', () => {
  const date = new Date('2023-01-01')
  expect(formatDate(date)).toBe('01/01/2023')
})