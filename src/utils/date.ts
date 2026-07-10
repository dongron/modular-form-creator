const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatCreatedAt(value: string | number | Date) {
  return createdAtFormatter.format(new Date(value))
}
