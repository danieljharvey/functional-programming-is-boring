import * as Read from './reader'
import * as R from 'fp-ts/Reader'
import * as M from 'fp-ts/Monoid'

describe('reader', () => {
  it('one', () => {
    expect(Read.one([R.of(1), R.of(2), R.of(3)])(true)).toEqual(6)
    expect(Read.one([])(true)).toEqual(0)
  })
  it('two', () => {
    expect(
      Read.two([R.of(1), R.of(2), R.of(3)], M.monoidSum)(true)
    ).toEqual(6)
    expect(Read.two([], M.monoidSum)(true)).toEqual(0)

    const reader2 = Read.two(
      [R.of(1), R.of(2), R.of(3), (a: number) => a + 1],
      M.monoidProduct
    )
    expect(reader2(10)).toEqual(66)
    expect(reader2(-1)).toEqual(0)
  })
  it('three', () => {
    const reader = Read.three(
      a => b => `${a} + ${b}`,
      (rA: number) => rA * 2,
      (rB: number) => rB * 3
    )
    expect(reader(0)).toEqual('0 + 0')
    expect(reader(2)).toEqual('4 + 6')
  })
  it('four', () => {
    const translationsEnglish = {
      greeting: 'Good morning',
      happyBirthday: 'Happy birthday',
      genericPleasantry: 'Have a nice day',
    }
    const reader = Read.four('Mr Horse', new Date('2020-01-01'))
    expect(
      reader({
        translations: translationsEnglish,
        date: new Date('2020-01-01'),
      })
    ).toEqual('Good morning, Mr Horse! Happy birthday!')
    expect(
      reader({
        translations: translationsEnglish,
        date: new Date('2021-02-01'),
      })
    ).toEqual('Good morning, Mr Horse! Have a nice day.')

    const translationsItalian = {
      greeting: 'Buongiorno',
      happyBirthday: 'Buon compleanno',
      genericPleasantry: 'Buona giornata',
    }
    expect(
      reader({
        translations: translationsItalian,
        date: new Date('2020-01-01'),
      })
    ).toEqual('Buongiorno, Mr Horse! Buon compleanno!')
    expect(
      reader({
        translations: translationsItalian,
        date: new Date('2021-02-01'),
      })
    ).toEqual('Buongiorno, Mr Horse! Buona giornata.')
  })
})
