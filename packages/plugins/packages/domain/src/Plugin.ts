import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoDomainWitnessConfig } from './Config'
import { XyoDomainPayload } from './Payload'
import { XyoDomainSchema } from './Schema'
import { XyoDomainWitness } from './Witness'
import { XyoDomainPayloadWrapper } from './Wrapper'

export const XyoDomainPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoDomainPayload, XyoModuleParams<XyoDomainWitnessConfig>>({
    schema: XyoDomainSchema,
    witness: async (params) => {
      return await XyoDomainWitness.create(params)
    },
    wrap: (payload: XyoPayload): XyoDomainPayloadWrapper => {
      assertEx(payload.schema === XyoDomainSchema)
      return new XyoDomainPayloadWrapper(payload as XyoDomainPayload)
    },
  })
