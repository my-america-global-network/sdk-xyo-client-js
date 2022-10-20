/**
 * @jest-environment jsdom
 */

import { XyoIdSchema } from './Schema'
import { XyoIdWitness, XyoIdWitnessConfig, XyoIdWitnessConfigSchema } from './Witness'

describe('XyoIdWitness [Browser]', () => {
  test('observe', async () => {
    const witness = await XyoIdWitness.create({
      config: { salt: 'test', schema: XyoIdWitnessConfigSchema, targetSchema: XyoIdSchema } as XyoIdWitnessConfig,
    })
    const [observation] = await witness.observe([{ salt: 'test' }])
    expect(observation.schema).toBe(XyoIdSchema)
  })
})
