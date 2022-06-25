import { XyoValidator } from '../../lib'
import { XyoPayloadWithMeta } from '../../models'
import { XyoPayloadValidator } from '../Validator'
import { XyoPayloadWrapper } from './Wrapper'

export class XyoPayloadWrapperValidator<T extends XyoPayloadWrapper<XyoPayloadWithMeta> = XyoPayloadWrapper<XyoPayloadWithMeta>> extends XyoValidator<T> {
  public get payload() {
    return new XyoPayloadValidator(this.obj.body)
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.payload.validate())
    return errors
  }
}
