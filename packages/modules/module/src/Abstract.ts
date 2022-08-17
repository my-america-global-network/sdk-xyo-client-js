import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'
import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoModule } from './Module'

export type XyoModuleConfig<TConfig extends XyoPayload = XyoPayload, TQuery extends XyoPayload = XyoPayload> = TConfig & {
  account: XyoAccount
  resolver?: (address: string) => XyoModule<XyoQueryPayload<TQuery>>
}

export abstract class XyoAbstractModule<TQuery extends XyoPayload = XyoPayload, TConfig extends XyoPayload = XyoPayload>
  implements XyoModule<TQuery>
{
  protected config: XyoModuleConfig<TConfig, TQuery>
  constructor(config: XyoModuleConfig<TConfig, TQuery>) {
    this.config = config
  }
  abstract query(query: XyoQueryPayload<TQuery>): Promisable<[XyoBoundWitness, (XyoPayload | null)[]]>

  get account() {
    return this.config.account
  }

  get address() {
    return this.account.addressValue.hex
  }

  bindHashes(hashes: string[], schema: string[]) {
    return new XyoBoundWitnessBuilder().hashes(hashes, schema).witness(this.account).build()
  }

  bindPayloads(payloads: (XyoPayload | null)[]) {
    return new XyoBoundWitnessBuilder().payloads(payloads).witness(this.account).build()
  }
}
