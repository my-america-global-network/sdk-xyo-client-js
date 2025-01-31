import { assertEx } from '@xylabs/assert'
import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { PromisableArray } from '@xyo-network/promise'
import Cookies from 'js-cookie'
import compact from 'lodash/compact'

import { XyoArchivistConfig } from './Config'
import {
  XyoArchivistAllQuerySchema,
  XyoArchivistClearQuerySchema,
  XyoArchivistCommitQuerySchema,
  XyoArchivistDeleteQuerySchema,
  XyoArchivistFindQuerySchema,
  XyoArchivistInsertQuery,
  XyoArchivistInsertQuerySchema,
} from './Queries'
import { XyoArchivist } from './XyoArchivist'

export type XyoCookieArchivistConfigSchema = 'network.xyo.module.config.archivist.cookie'
export const XyoCookieArchivistConfigSchema: XyoCookieArchivistConfigSchema = 'network.xyo.module.config.archivist.cookie'

export type XyoCookieArchivistConfig = XyoArchivistConfig<{
  domain?: string
  maxEntries?: number
  maxEntrySize?: number
  namespace?: string
  schema: XyoCookieArchivistConfigSchema
}>

export class XyoCookieArchivist extends XyoArchivist<XyoCookieArchivistConfig> {
  static override configSchema = XyoCookieArchivistConfigSchema

  public get domain() {
    return this.config?.domain
  }

  public get maxEntries() {
    //all browsers support at least 60 cookies
    return this.config?.maxEntries ?? 60
  }

  public get maxEntrySize() {
    //all browsers support at least 4000 length per cookie
    return this.config?.maxEntrySize ?? 4000
  }

  public get namespace() {
    return this.config?.namespace ?? 'xyoarch'
  }

  static override async create(params?: XyoModuleParams<XyoCookieArchivistConfig>): Promise<XyoCookieArchivist> {
    return (await super.create(params)) as XyoCookieArchivist
  }

  public override all(): PromisableArray<XyoPayload> {
    try {
      return Object.entries(Cookies.get())
        .filter(([key]) => key.startsWith(`${this.namespace}-`))
        .map(([, value]) => JSON.parse(value))
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override clear(): void | Promise<void> {
    try {
      Object.entries(Cookies.get()).map(([key]) => {
        if (key.startsWith(`${this.namespace}-`)) {
          Cookies.remove(key)
        }
      })
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override async commit(): Promise<XyoBoundWitness[]> {
    try {
      const payloads = await this.all()
      assertEx(payloads.length > 0, 'Nothing to commit')
      const settled = await Promise.allSettled(
        compact(
          Object.values(this.parents?.commit ?? [])?.map(async (parent) => {
            const queryPayload = PayloadWrapper.parse<XyoArchivistInsertQuery>({
              payloads: payloads.map((payload) => PayloadWrapper.hash(payload)),
              schema: XyoArchivistInsertQuerySchema,
            })
            const query = await this.bindQuery(queryPayload)
            return (await parent?.query(query[0], query[1]))?.[0]
          }),
        ),
      )
      await this.clear()
      return compact(
        settled.map((result) => {
          return result.status === 'fulfilled' ? result.value : null
        }),
      )
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override delete(hashes: string[]): PromisableArray<boolean> {
    try {
      return hashes.map((hash) => {
        Cookies.remove(this.keyFromHash(hash))
        return true
      })
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public async get(hashes: string[]): Promise<XyoPayload[]> {
    try {
      return await Promise.all(
        hashes.map(async (hash) => {
          const cookieString = Cookies.get(this.keyFromHash(hash))
          return cookieString ? JSON.parse(cookieString) : (await this.getFromParents(hash)) ?? null
        }),
      )
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public async insert(payloads: XyoPayload[]): Promise<XyoBoundWitness[]> {
    try {
      const storedPayloads: XyoPayload[] = payloads.map((payload) => {
        const wrapper = new PayloadWrapper(payload)
        const key = this.keyFromHash(wrapper.hash)
        const value = JSON.stringify(wrapper.payload)
        assertEx(value.length < this.maxEntrySize, `Payload too large [${wrapper.hash}, ${value.length}]`)
        Cookies.set(key, JSON.stringify(wrapper.payload))
        return wrapper.payload
      })
      const result = await this.bindResult([...storedPayloads])
      const parentBoundWitnesses: XyoBoundWitness[] = []
      if (this.writeThrough) {
        //we store the child bw also
        parentBoundWitnesses.push(...(await this.writeToParents([result[0], ...storedPayloads])))
      }
      return [result[0], ...parentBoundWitnesses]
    } catch (ex) {
      console.error(`Error: ${JSON.stringify(ex, null, 2)}`)
      throw ex
    }
  }

  public override queries() {
    return [
      XyoArchivistAllQuerySchema,
      XyoArchivistDeleteQuerySchema,
      XyoArchivistClearQuerySchema,
      XyoArchivistFindQuerySchema,
      XyoArchivistCommitQuerySchema,
      ...super.queries(),
    ]
  }

  private keyFromHash(hash: string) {
    return `${this.namespace}-${hash}`
  }
}
