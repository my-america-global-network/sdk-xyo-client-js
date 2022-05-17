import { defaultCoins, defaultCurrencies } from './defaults'
import { pricesFromCoinGecko } from './pricesFromCoinGecko'

describe('XyoSystemInfoWitness', () => {
  test('observe', async () => {
    const assets = await pricesFromCoinGecko(defaultCoins, defaultCurrencies)
    expect(assets.btc?.btc).toBe(1)
  })
})
