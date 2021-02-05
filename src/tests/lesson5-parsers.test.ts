import {
  bulbEmailParser,
  msnParser,
  yearParser,
  batchNumberParser,
  purchasingCompanyParser,
  runParser,
  manufacturerParser,
} from '../lesson5-parsers'
import * as O from 'fp-ts/Option'

describe('Lesson 7 - parsers', () => {
  describe.skip('Email parser', () => {
    it('Fail on nonsense', () => {
      expect(runParser(bulbEmailParser, 'dfgjkldfgjdfjlkg')).toEqual(
        O.none
      )
    })
    it('Finds a UK email', () => {
      expect(
        runParser(bulbEmailParser, 'bobbydavehead@bulb.co.uk')
      ).toEqual(O.some({ name: 'bobbydavehead', country: 'UK' }))
    })

    it('Finds a Spanish email', () => {
      expect(
        runParser(bulbEmailParser, 'salvadordali@bulb.es')
      ).toEqual(O.some({ name: 'salvadordali', country: 'SPAIN' }))
    })
    it('Finds a French email', () => {
      expect(
        runParser(bulbEmailParser, 'jacquesbrel@bulb.fr')
      ).toEqual(O.some({ name: 'jacquesbrel', country: 'FRANCE' }))
    })
    it('Finds an American email', () => {
      expect(
        runParser(bulbEmailParser, 'billmurray@bulb.com')
      ).toEqual(O.some({ name: 'billmurray', country: 'USA' }))
    })
    it('Rejects a nearly correct email', () => {
      expect(runParser(bulbEmailParser, 'bruce@bolb.co.uk')).toEqual(
        O.none
      )
    })
  })
  describe.skip('MSN parser', () => {
    it('Fail on nonsense', () => {
      expect(runParser(msnParser, 'dfgjkldfgjdfjlkg')).toEqual(O.none)
    })
    it('Year parser fail', () => {
      expect(runParser(yearParser, 'dog')).toEqual(O.none)
    })
    it('Year parser success', () => {
      expect(runParser(yearParser, '21')).toEqual(O.some(21))
    })
    it('Batch number fail', () => {
      expect(runParser(batchNumberParser, '1234')).toEqual(O.none)
    })
    it('Batch number success', () => {
      expect(runParser(batchNumberParser, '123456')).toEqual(
        O.some(123456)
      )
    })
    it('ManufacturerCode fail', () => {
      expect(runParser(manufacturerParser, '!')).toEqual(O.none)
    })
    it('ManufacturerCode success', () => {
      expect(runParser(manufacturerParser, 'H')).toEqual(
        O.some('Secure')
      )
    })
    it('PurchasingCompany fail', () => {
      expect(runParser(purchasingCompanyParser, '**!?')).toEqual(
        O.none
      )
    })
    it('PurchasingCompany success', () => {
      expect(runParser(purchasingCompanyParser, 'OB')).toEqual(
        O.some('OB')
      )
    })

    it('Too many year numbers', () => {
      expect(runParser(msnParser, 'D961BL123456')).toEqual(O.none)
    })
    it('Too many batch numbers', () => {
      expect(runParser(msnParser, 'D96BL1123456')).toEqual(O.none)
    })
    it('Too few batch numbers', () => {
      expect(runParser(msnParser, 'D96BL1234')).toEqual(O.none)
    })

    it('Identifies a meter', () => {
      expect(runParser(msnParser, 'D96BL123456')).toEqual(
        O.some({
          manufacturer: 'Landis+Gyr',
          year: 96,
          batchNumber: 123456,
          purchasingCompany: 'BL',
        })
      )
    })
    it('Identifies another meter', () => {
      expect(runParser(msnParser, 'H20BL123456')).toEqual(
        O.some({
          manufacturer: 'Secure',
          year: 20,
          batchNumber: 123456,
          purchasingCompany: 'BL',
        })
      )
    })
    it('Identifies another meter with 5 figure batch number', () => {
      expect(runParser(msnParser, 'H20BL12345')).toEqual(
        O.some({
          manufacturer: 'Secure',
          year: 20,
          batchNumber: 12345,
          purchasingCompany: 'BL',
        })
      )
    })
  })
})
