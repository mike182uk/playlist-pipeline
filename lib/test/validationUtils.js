function findErrorByContextLabel (error, label) {
  for (const err of error.details) {
    if (err.context.label === label) {
      return err
    }
  }
}

module.exports = {
  findErrorByContextLabel
}
