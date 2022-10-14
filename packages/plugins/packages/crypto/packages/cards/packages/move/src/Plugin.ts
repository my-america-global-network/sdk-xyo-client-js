import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema } from './Schema'
import { XyoXyoCryptoCardsMovePayloadTemplate } from './Template'
import { XyoCryptoCardsMoveWitness, XyoCryptoCardsMoveWitnessConfig } from './Witness'

export const XyoCryptoCardsMovePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig>({
    auto: true,
    schema: XyoCryptoCardsMoveSchema,
    template: XyoXyoCryptoCardsMovePayloadTemplate,
    witness: (params) => {
      return new XyoCryptoCardsMoveWitness(params)
    },
  })
