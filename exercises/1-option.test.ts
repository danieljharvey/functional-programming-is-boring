import * as Exercises from './1-option'
import * as O from 'fp-ts/Option'
import * as S from 'fp-ts/Semigroup'

describe.skip('1) Option exercises', () => {
  it('one', () => {
    expect(Exercises.one(null)).toEqual(O.none)
    expect(Exercises.one('horse')).toEqual(O.some('horse'))
  })
  it('two', () => {
    expect(Exercises.two(null)).toEqual(O.none)
    expect(Exercises.two(undefined)).toEqual(O.none)
    expect(Exercises.two(false)).toEqual(O.some(false))
    expect(Exercises.two('horse')).toEqual(O.some('horse'))
  })
  it('three', () => {
    expect(Exercises.three(O.none)).toEqual('oh no')
    expect(Exercises.three(O.some('horses'))).toEqual('horses')
  })
  it('four', () => {
    expect(Exercises.four(O.none)).toEqual(null)
    expect(Exercises.four(O.some('horses'))).toEqual('horses')
  })
  it('five', () => {
    expect(Exercises.five([])).toEqual(O.none)
    expect(Exercises.five(['horse'])).toEqual(O.some('horse'))
    expect(Exercises.five([null])).toEqual(O.some(null))
    expect(Exercises.five([false])).toEqual(O.some(false))
  })
  it('six', () => {
    expect(Exercises.six([], a => true)).toEqual(O.none)
    expect(
      Exercises.six(['horse', 'of course'], a => a !== 'horse')
    ).toEqual(O.some('of course'))
    expect(Exercises.six([null], a => true)).toEqual(O.some(null))
    expect(Exercises.six([false], a => true)).toEqual(O.some(false))
    expect(Exercises.six([1, 2, 3], a => a > 2)).toEqual(O.some(3))
  })
  it('seven', () => {
    expect(Exercises.seven(O.none)).toEqual(O.none)
    expect(Exercises.seven(O.some(100))).toEqual(O.some(200))
  })
  it('eight', () => {
    expect(Exercises.eight([], _ => O.some(1))).toEqual([])
    const toNumber = (s: string): O.Option<number> => {
      const n = parseInt(s, 10)
      return String(n) === s ? O.some(n) : O.none
    }
    expect(
      Exercises.eight(['sdsdf', 'sdfsdf', 'sdfsdf3'], _ => O.none)
    ).toEqual([])
    expect(
      Exercises.eight(['1', '2', 'horse', '3'], toNumber)
    ).toEqual([1, 2, 3])
  })
  it('nine', () => {
    expect(Exercises.nine([])).toEqual(O.none)
    expect(Exercises.nine([[], [1]])).toEqual(O.none)
    expect(Exercises.nine([[1], [2]])).toEqual(O.some(1))
  })
  it('ten', () => {
    expect(Exercises.ten([])).toEqual(0)
    expect(Exercises.ten([O.none, O.none])).toEqual(0)
    expect(Exercises.ten([O.some(1), O.none, O.some(10)])).toEqual(11)
  })
  it('eleven', () => {
    expect(Exercises.eleven([], S.semigroupSum)).toEqual(O.none)
    expect(Exercises.eleven([O.none], S.semigroupSum)).toEqual(O.none)
    expect(
      Exercises.eleven([O.none, O.some(1)], S.semigroupSum)
    ).toEqual(O.some(1))
    expect(
      Exercises.eleven(
        [O.some(10), O.none, O.some(1)],
        S.semigroupSum
      )
    ).toEqual(O.some(11))
    expect(Exercises.eleven([], S.semigroupAll)).toEqual(O.none)
    expect(Exercises.eleven([O.none], S.semigroupAll)).toEqual(O.none)
    expect(
      Exercises.eleven([O.none, O.some(true)], S.semigroupAll)
    ).toEqual(O.some(true))
    expect(
      Exercises.eleven(
        [O.some(true), O.none, O.some(false)],
        S.semigroupAll
      )
    ).toEqual(O.some(false))
  })

  it('twelve', () => {
    expect(
      Exercises.twelve(a => b => a + b, O.none, O.some(1))
    ).toEqual(O.none)
    expect(
      Exercises.twelve(a => b => a + b, O.some(1), O.none)
    ).toEqual(O.none)
    expect(
      Exercises.twelve(a => b => a + b, O.some(1), O.some(2))
    ).toEqual(O.some(3))
    expect(
      Exercises.twelve(
        a => b => a.repeat(b),
        O.some('horse'),
        O.some(2)
      )
    ).toEqual(O.some('horsehorse'))
  })

  it('thirteen', () => {
    expect(Exercises.thirteen([O.none])).toEqual(O.none)
    expect(Exercises.thirteen([])).toEqual(O.some([]))
    expect(Exercises.thirteen([O.some(1), O.some(2)])).toEqual(
      O.some([1, 2])
    )
  })
})
