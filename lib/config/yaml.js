const fs = require('fs')
const yaml = require('js-yaml')
const { promisify } = require('util')

const readFile = promisify(fs.readFile)

/**
 * Load YAML config from the provided path
 *
 * @param {string} path
 *
 * @returns {Promise<object>}
 */
async function loadYAMLConfig (path) {
  try {
    const yamlData = await readFile(path)
    const config = await yaml.load(yamlData)

    if (typeof config !== 'object') {
      throw new Error('loaded config is invalid')
    }

    return config
  } catch (err) {
    throw new Error(`failed to load YAML config: ${err.message}`)
  }
}

module.exports = {
  loadYAMLConfig
}
