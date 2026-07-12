export function getSubmitLabel(isSubmitting: boolean, isCompleted: boolean): string {
  if (isSubmitting) return 'Saving…'
  if (isCompleted) return 'Submit changes'
  return 'Save changes'
}
