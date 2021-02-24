import * as E from 'fp-ts/Either'
import {
  checkName,
  checkAge,
  checkMarketing,
  checkForm,
  checkFormWithNiceError,
} from './Either'

describe('Either examples', () => {
  describe('checkName', () => {
    it('succeeds', () => {
      expect(checkName('Bruce')).toEqual(E.right('Bruce'))
    })
    it('fails', () => {
      expect(checkName('Horse')).toEqual(E.left('NAME_IS_HORSE'))
      expect(checkName('')).toEqual(E.left('NO_NAME'))
    })
  })
  describe('checkAge', () => {
    it('succeeds', () => {
      expect(checkAge(100)).toEqual(E.right(100))
    })
    it('fails', () => {
      expect(checkAge(-1)).toEqual(E.left('AGE_TOO_LOW'))
    })
  })
  describe('checkMarketing', () => {
    it('succeeds', () => {
      expect(checkMarketing(true)).toEqual(E.right(true))
    })
    it('fails', () => {
      expect(checkMarketing(false)).toEqual(
        E.left('MUST_AGREE_TO_OBLIGATORY_MARKETING_MESSAGING')
      )
    })
  })
  describe('checkForm', () => {
    it('succeeds', () => {
      expect(
        checkForm({
          name: 'Bruce',
          age: 100,
          agreesToReceiveMarketingMessages: true,
        })
      ).toEqual(
        E.right({
          type: 'GoodForm',
          name: 'Bruce',
          age: 100,
          agreesToReceiveMarketingMessages: true,
        })
      )
    })
    it('fails', () => {
      expect(
        checkForm({
          name: 'Bruce',
          age: -100,
          agreesToReceiveMarketingMessages: false,
        })
      ).toEqual(E.left('AGE_TOO_LOW'))
    })
  })
  describe('checkFormWithNiceError', () => {
    it('succeeds', () => {
      expect(
        checkFormWithNiceError({
          name: 'Bruce',
          age: 100,
          agreesToReceiveMarketingMessages: true,
        })
      ).toEqual(
        E.right({
          type: 'GoodForm',
          name: 'Bruce',
          age: 100,
          agreesToReceiveMarketingMessages: true,
        })
      )
    })
    it('fails', () => {
      expect(
        checkFormWithNiceError({
          name: 'Bruce',
          age: 100,
          agreesToReceiveMarketingMessages: false,
        })
      ).toEqual(
        E.left(
          'You must agree to receive endless marketing information forever to continue'
        )
      )
    })
  })
})
