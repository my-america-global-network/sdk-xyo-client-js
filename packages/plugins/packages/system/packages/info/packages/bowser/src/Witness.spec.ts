/**
 * @jest-environment jsdom
 */

import crypto from 'crypto'

import { XyoBowserSystemInfoWitnessConfigSchema } from './Config'
import { XyoBowserSystemInfoSchema } from './Schema'
import { XyoBowserSystemInfoWitness } from './Witness'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoPolyfill = (window: Window & typeof globalThis) => {
  window.crypto = window.crypto ?? {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length),
  }
}

cryptoPolyfill(window)

describe('XyoBowserSystemInfo', () => {
  test('observe', async () => {
    const witness = new XyoBowserSystemInfoWitness({
      config: {
        schema: XyoBowserSystemInfoWitnessConfigSchema,
        targetSchema: XyoBowserSystemInfoSchema,
      },
      logger: console,
    })
    await witness.start()
    const [observation] = await witness.observe()
    console.log(JSON.stringify(observation, null, 2))
    expect(observation.schema).toBe(XyoBowserSystemInfoSchema)
  })
})
