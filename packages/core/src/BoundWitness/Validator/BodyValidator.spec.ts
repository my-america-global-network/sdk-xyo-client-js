import { dumpErrors } from '../../lib'
import { testBoundWitness } from '../../Test'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'

test('all', () => {
  const validator = new XyoBoundWitnessBodyValidator(testBoundWitness)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
