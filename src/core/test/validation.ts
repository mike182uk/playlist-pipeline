import type { ValidationError, ValidationErrorItem } from "joi"

export function findErrorByContextLabel(
  error: ValidationError | undefined,
  label: string
): ValidationErrorItem | undefined {
  return error?.details.find((err) => err.context?.label === label)
}
