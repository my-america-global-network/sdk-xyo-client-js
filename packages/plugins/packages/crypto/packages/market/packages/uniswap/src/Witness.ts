import { Provider } from '@ethersproject/providers'
import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { createUniswapPoolContracts, EthersUniSwap3Pair, pricesFromUniswap3, UniswapPoolContracts } from './lib'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketSchema, XyoUniswapCryptoMarketWitnessConfigSchema } from './Schema'

export interface XyoUniswapCryptoMarketWitnessParams extends XyoModuleParams<XyoUniswapCryptoMarketWitnessConfig> {
  provider: Provider
}

export class XyoUniswapCryptoMarketWitness extends XyoWitness<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig> {
  static override configSchema = XyoUniswapCryptoMarketWitnessConfigSchema
  static override targetSchema = XyoUniswapCryptoMarketSchema

  protected pairs?: EthersUniSwap3Pair[]
  protected provider?: Provider
  protected constructor(params: XyoUniswapCryptoMarketWitnessParams) {
    super(params)
    this.provider = params?.provider
  }

  static override async create(params?: XyoUniswapCryptoMarketWitnessParams): Promise<XyoUniswapCryptoMarketWitness> {
    return (await super.create(params)) as XyoUniswapCryptoMarketWitness
  }

  override async observe(): Promise<XyoUniswapCryptoMarketPayload[]> {
    this.started('throw')
    const pairs = await pricesFromUniswap3(assertEx(this.pairs))
    const timestamp = Date.now()

    const payload: Partial<XyoUniswapCryptoMarketPayload> = {
      pairs,
      timestamp,
    }

    return super.observe([payload])
  }

  override async start() {
    this.pairs = createUniswapPoolContracts(assertEx(this.provider, 'Provider Required'), this.config?.pools ?? UniswapPoolContracts)
    return await super.start()
  }
}
