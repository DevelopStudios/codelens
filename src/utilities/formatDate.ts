export function formatDate(date: Date): string {
  // Handle invalid dates
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }

  // Format in UTC to avoid timezone issues. Using the `timeZone` option is
  // robust at the extremes — manually shifting by the offset overflows the
  // representable date range for the min/max Date values.
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}