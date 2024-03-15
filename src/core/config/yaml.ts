import { readFile } from "node:fs/promises"
import yaml from "js-yaml"

export async function loadYAMLConfig(path): Promise<Record<string, unknown>> {
  try {
    const yamlData = await readFile(path)
    const config = await yaml.load(yamlData)

    if (typeof config !== "object") {
      throw new Error("loaded config is invalid")
    }

    return config
  } catch (err) {
    throw new Error(`failed to load YAML config: ${err.message}`)
  }
}
