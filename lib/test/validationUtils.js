/**
 * Find an error by its label
 *
 * @param {object} error
 * @param {string} label
 *
 * @returns {object|undefined}
 */
export function findErrorByContextLabel(error, label) {
  for (const err of error.details) {
    if (err.context.label === label) {
      return err
    }
  }
}
