#!/usr/bin/env node

const Conf = require('conf')

const appData = new Conf({
  // This will force the existing config to be cleared as it will be encrypted
  // and we have not provided the encryption key here
  clearInvalidConfig: true
})

console.log(`Clearing app data: ${appData.path}`)
