const tempWrite = require('temp-write')
const { loadYAMLConfig } = require('./yaml')

describe('loadYAMLConfig', () => {
  test('successfully loads config from YAML', async () => {
    const path = await tempWrite(`
  foo: bar
  baz:
    - qux
  `)

    const config = await loadYAMLConfig(path)

    expect(config).toMatchObject({
      foo: 'bar',
      baz: ['qux']
    })
  })

  test('throws an error if the config can not be loaded', async () => {
    const path = await tempWrite('`')

    await expect(loadYAMLConfig(path)).rejects.toThrow(/failed to load YAML config:/)
  })

  test('throws an error if the loaded config is invalid', async () => {
    const path = await tempWrite('foo bar baz')

    await expect(loadYAMLConfig(path)).rejects.toThrow(/failed to load YAML config: loaded config is invalid/)
  })
})
