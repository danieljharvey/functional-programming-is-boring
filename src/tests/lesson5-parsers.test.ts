import {
  bulbEmailParser,
  msnParser,
  yearParser,
  batchNumberParser,
  purchasingCompanyParser,
  runParser,
  manufacturerParser,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
  ten,
  eleven,
  twelve,
} from '../lesson5-parsers'
import * as O from 'fp-ts/Option'

describe('Lesson 7 - parsers', () => {
  describe.skip('Warm ups', () => {
    it('one parses any character', () => {
      expect(runParser(one, '')).toEqual(O.none)
      expect(runParser(one, 'G')).toEqual(O.some('G'))
    })
    it('two parses any digit', () => {
      expect(runParser(two, 'H')).toEqual(O.none)
      expect(runParser(two, '1')).toEqual(O.some('1'))
    })
    it('three parses any digit and maps it into a number', () => {
      expect(runParser(three, 'H')).toEqual(O.none)
      expect(runParser(three, '5')).toEqual(O.some(5))
    })
    it('four parses any letter expect H', () => {
      expect(runParser(four, 'H')).toEqual(O.none)
      expect(runParser(four, 'h')).toEqual(O.none)
      expect(runParser(four, '!')).toEqual(O.none)
      expect(runParser(four, '3')).toEqual(O.none)
      expect(runParser(four, 'a')).toEqual(O.some('a'))
      expect(runParser(four, 'A')).toEqual(O.some('A'))
    })
    it('five parses an array of one or more exclamation marks', () => {
      expect(runParser(five, 'sdf')).toEqual(O.none)
      expect(runParser(five, '!')).toEqual(O.some(['!']))
      expect(runParser(five, '!!!!!')).toEqual(
        O.some(['!', '!', '!', '!', '!'])
      )
    })
    it('six parses a string of exclamation marks', () => {
      expect(runParser(six, 'sdf')).toEqual(O.none)
      expect(runParser(six, '!')).toEqual(O.some('!'))
      expect(runParser(six, '!!!!!')).toEqual(O.some('!!!!!'))
    })
    it('seven parses a string of alphanumeric chars', () => {
      expect(runParser(seven, ' ')).toEqual(O.none)
      expect(runParser(seven, '!dog')).toEqual(O.none)
      expect(runParser(seven, 'dog?')).toEqual(O.none)
      expect(runParser(seven, 'Horse')).toEqual(O.some('Horse'))
      expect(runParser(seven, 'dog')).toEqual(O.some('dog'))
    })
    it('eight parses two words separated by whitespace', () => {
      expect(runParser(eight, ' ')).toEqual(O.none)
      expect(runParser(eight, 'dog')).toEqual(O.none)
      expect(runParser(eight, 'dog ')).toEqual(O.none)
      expect(runParser(eight, 'dog time')).toEqual(
        O.some(['dog', 'time'])
      )
    })
    it('nine parses horse and horse only', () => {
      expect(runParser(nine, 'sdfasdf')).toEqual(O.none)
      expect(runParser(nine, 'horse')).toEqual(O.some('horse'))
    })
    it('ten parses one or more comma separated digits', () => {
      expect(runParser(ten, ' ')).toEqual(O.none)
      expect(runParser(ten, '1,2,3,log')).toEqual(O.none)
      expect(runParser(ten, '1,2,3,')).toEqual(O.none)
      expect(runParser(ten, '1')).toEqual(O.some([1]))
      expect(runParser(ten, '1,2,3')).toEqual(O.some([1, 2, 3]))
    })
    it('eleven parses dog or log', () => {
      expect(runParser(eleven, 'sdfasdf')).toEqual(O.none)
      expect(runParser(eleven, 'dog')).toEqual(O.some('dog'))
      expect(runParser(eleven, 'log')).toEqual(O.some('log'))
    })
    it('twelve parses traffic lights', () => {
      expect(runParser(twelve, '')).toEqual(O.none)
      expect(runParser(twelve, 'red')).toEqual(
        O.some({ type: 'Stop' })
      )
      expect(runParser(twelve, 'yellow')).toEqual(
        O.some({ type: 'GetReady' })
      )
      expect(runParser(twelve, 'green')).toEqual(
        O.some({ type: 'Go' })
      )
    })
  })
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
