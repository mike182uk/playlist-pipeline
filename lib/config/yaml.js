const fs = require('fs')
const yaml = require('js-yaml')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

async function loadYAMLConfig (path) {
  try {
    const yamlData = await readFile(path)
    const config = await yaml.load(yamlData)

    if (typeof config !== 'object') {
      throw new Error('Loaded config is not an object')
    }

    return config
  } catch (err) {
    throw new Error(`Failed to load config due to: ${err.message}`)
  }
}

module.exports = {
  loadYAMLConfig
}
