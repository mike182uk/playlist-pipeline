import { readFile } from 'node:fs/promises'
import yaml from 'js-yaml'

/**
 * Load YAML config from the provided path
 *
 * @param {string} path
 *
 * @returns {Promise<object>}
 */
export async function loadYAMLConfig (path) {
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
