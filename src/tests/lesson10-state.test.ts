import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/State'
import {
  defaultStable,
  addHorseToStable,
  getHorses,
  countHorses,
  standardiseHorses,
  one,
  two,
  three,
} from '../lesson10-state'

describe('State', () => {
  it('addHorseToStable works', () => {
    const newState = S.execute(defaultStable)(
      addHorseToStable({
        horseName: 'Mr Horse',
        age: 100,
        hasTail: true,
        numberOfLegs: 4,
      })
    )
    expect(newState.horses.length).toBeGreaterThan(0)
  })
  describe('getHorses', () => {
    it('gets zero horses', () => {
      expect(S.evaluate(defaultStable)(getHorses())).toHaveLength(0)
    })
    it('gets one horse', () => {
      expect(
        S.evaluate(defaultStable)(
          pipe(
            addHorseToStable({
              horseName: 'Mr Horse',
              age: 100,
              hasTail: true,
              numberOfLegs: 4,
            }),
            S.chain(_ => getHorses())
          )
        )
      ).toHaveLength(1)
    })
  })
  describe('standardiseHorses', () => {
    it('filtering zero horses leaves zero horses', () => {
      expect(
        S.evaluate(defaultStable)(
          pipe(
            standardiseHorses(),
            S.chain(_ => countHorses())
          )
        )
      ).toEqual(0)
    })
    it('gets one horse', () => {
      expect(
        S.evaluate(defaultStable)(
          pipe(
            addHorseToStable({
              horseName: 'Mr Horse',
              age: 100,
              hasTail: true,
              numberOfLegs: 3,
            }),
            S.chain(_ =>
              addHorseToStable({
                horseName: 'Mrs Horse',
                age: 100,
                hasTail: true,
                numberOfLegs: 4,
              })
            ),
            S.chain(_ => standardiseHorses()),
            S.chain(_ => countHorses())
          )
        )
      ).toEqual(1)
    })
  })
  describe('state exercises', () => {
    it('one', () => {
      expect(one(S.of('stuff'), 100)).toEqual(100)
    })
    it('two', () => {
      expect(two(S.of('stuff'), 100)).toEqual('stuff')
    })
    it('three', () => {
      expect(S.execState(three(), 100)).toEqual(101)
    })
  })
})
