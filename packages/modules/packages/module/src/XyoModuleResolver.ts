import { ModuleResolver, ModuleResolverEventFunc } from './ModuleResolver'
import { XyoModule } from './XyoModule'

export class XyoModuleResolver implements ModuleResolver {
  private handlers: ModuleResolverEventFunc<XyoModule>[] = []
  private modules: Record<string, XyoModule> = {}

  public get isModuleResolver() {
    return true
  }

  add(module?: XyoModule | XyoModule[]) {
    if (Array.isArray(module)) {
      module.forEach((module) => this.addSingleModule(module))
    } else {
      this.addSingleModule(module)
    }
    return this
  }

  fromAddress(addresses: string[]): (XyoModule | null)[] {
    return addresses.map((address) => this.modules[address] ?? null)
  }

  fromQuery(schema: string[]): XyoModule[] {
    return Object.values(this.modules).filter((module) => schema.reduce((prev, schema) => prev && module.queryable(schema), true))
  }

  remove(module?: XyoModule | XyoModule[]) {
    if (Array.isArray(module)) {
      module.forEach((module) => this.removeSingleModule(module))
    } else {
      this.removeSingleModule(module)
    }
    return this
  }

  subscribe(handler: ModuleResolverEventFunc): void {
    this.unsubscribe(handler)
    this.handlers.push(handler)
  }

  unsubscribe(handler: ModuleResolverEventFunc): void {
    this.handlers = this.handlers.filter((item) => item !== handler)
  }

  private addSingleModule(module?: XyoModule) {
    if (module) {
      this.modules[module.address] = module
    }
  }

  private removeSingleModule(module?: XyoModule) {
    if (module) {
      delete this.modules[module.address]
    }
  }
}
