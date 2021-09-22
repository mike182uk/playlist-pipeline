#!/usr/bin/env node

const APP_DATA_ENCRYPTION_KEY = 'e40cbeb4a981bd089cfd149223eb74fbd9e88834' // https://github.com/sindresorhus/conf#encryptionkey

const Conf = require('conf')

const appData = new Conf({
  encryptionKey: APP_DATA_ENCRYPTION_KEY
})

console.log(`Clearing app data: ${appData.path}`)

appData.clear()
