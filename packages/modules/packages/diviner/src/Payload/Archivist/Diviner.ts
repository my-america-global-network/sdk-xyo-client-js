import { assertEx } from '@xylabs/assert'
import { XyoArchivistGetQueryPayloadSchema } from '@xyo-network/archivist'
import { Huri, XyoPayload, XyoPayloads } from '@xyo-network/payload'

import { PartialDivinerConfig } from '../../PartialDivinerConfig'
import { XyoDivinerDivineQuerySchema } from '../../Query'
import { profile } from '../lib'
import { XyoHuriPayload, XyoHuriPayloadSchema } from '../XyoHuriPayload'
import { XyoPayloadDiviner } from '../XyoPayloadDiviner'
import { XyoArchivistPayloadDivinerConfig, XyoArchivistPayloadDivinerConfigSchema } from './Config'

export class XyoArchivistPayloadDiviner extends XyoPayloadDiviner<XyoPayload, XyoArchivistPayloadDivinerConfig> {
  constructor(config: PartialDivinerConfig<XyoArchivistPayloadDivinerConfig>) {
    super({ ...config, schema: XyoArchivistPayloadDivinerConfigSchema })
  }

  protected get archivist() {
    return this.config.archivist
  }

  override get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  public async divine(payloads?: XyoPayloads): Promise<XyoPayload | null> {
    const huriPayload = assertEx(payloads?.find((payload): payload is XyoHuriPayload => payload?.schema === XyoHuriPayloadSchema))
    const huriObj = new Huri(huriPayload.huri)
    const [[, [payload = null]]] = await profile(
      async () => await this.archivist.query({ hashes: [huriObj.hash], schema: XyoArchivistGetQueryPayloadSchema }),
    )
    return payload ?? null
  }
}
