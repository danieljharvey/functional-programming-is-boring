import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/State'
import * as State from './state'
import * as O from 'fp-ts/Option'

describe('State', () => {
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
})
