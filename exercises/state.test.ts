import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/State'
import * as State from './state'
import * as O from 'fp-ts/Option'

describe.skip('State', () => {
  it('one', () => {
    expect(State.one(S.of('stuff'), 100)).toEqual(100)
  })
  it('two', () => {
    expect(State.two(S.of('stuff'), 100)).toEqual('stuff')
  })
  it('three', () => {
    expect(S.execState(State.three(), 100)).toEqual(101)
  })
  it('four', () => {
    expect(S.execState(State.four(), 100)).toEqual(100)
  })
  it('five', () => {
    expect(S.execState(State.five('goodbye'), ['hello'])).toEqual([
      'hello',
      'goodbye',
    ])
    expect(S.execState(State.five('goodbye'), [])).toEqual([
      'goodbye',
    ])
  })
  it('six', () => {
    expect(
      S.evalState(State.six('dog'), { dog: 100, cat: 99 })
    ).toEqual(O.some(100))
    expect(
      S.evalState(State.six('dog'), { log: 100, cat: 99 })
    ).toEqual(O.none)
  })
  it('seven', () => {
    expect(S.execState(State.seven(), [1, 2, 3])).toEqual([2, 3, 4])
  })
  it('eight', () => {
    const horses: State.Horse[] = [
      {
        horseName: 'Buttery Ken',
        age: 10,
        numberOfLegs: 3,
        hasTail: false,
      },
      {
        horseName: 'Infinite Jeff',
        age: 9,
        hasTail: true,
        numberOfLegs: 4,
      },
    ]
    expect(S.evalState(State.eight(), horses)).toEqual([horses[0]])
  })
  it('nine', () => {
    expect(
      S.evalState(State.nine(S.of([1, 2]), S.of([3, 4])), 'test')
    ).toEqual([1, 2, 3, 4])
  })
  it('ten', () => {
    const a = pipe(
      S.of<number, number>(1),
      S.chainFirst(_ => S.modify<number>(i => i + 1))
    )
    const b = pipe(
      S.of<number, number>(10),
      S.chainFirst(_ => S.modify(i => i + 100))
    )
    expect(State.ten(a1 => b1 => a1 + b1, a, b)(0)).toEqual([11, 101])
  })
  it('eleven', () => {
    const fn = (a: number) => a + 1
    const value = 'dogs'
    expect(State.eleven(value, fn)(100)).toEqual(['dogs', 101])
  })
})
