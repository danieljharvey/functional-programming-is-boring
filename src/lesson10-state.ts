import * as S from 'fp-ts/State'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

// The state monad lets us store and update some state throughout a
// computation.
//
// This allows us to keep computations pure but still organise them in a more
// familiar way

type Horse = {
  horseName: string
  age: number
  numberOfLegs: number
  hasTail: boolean
}

type Stable = {
  name: string
  horses: Horse[]
}

// adds the given Horse into our stable, returning the new number of horses
export const addHorseToStable = (
  horse: Horse
): S.State<Stable, number> =>
  pipe(
    S.modify<Stable>(stable => ({
      ...stable,
      horses: [...stable.horses, horse],
    })),
    S.chain(_ => S.gets(stable => stable.horses.length))
  )

export const setStableName = (name: string): S.State<Stable, void> =>
  S.modify(stable => ({ ...stable, name }))

export const getHorses = (): S.State<Stable, Horse[]> =>
  S.gets(stable => stable.horses)

export const countHorses = (): S.State<Stable, number> =>
  pipe(
    getHorses(),
    S.map(horses => horses.length)
  )

// WIP
export const getOldestHorse = (): S.State<Stable, O.Option<Horse>> =>
  S.of(O.none)

export const doHorseStuff: S.State<Stable, number> = pipe(
  setStableName("The Horse's Table"),
  S.chain(_ =>
    addHorseToStable({
      horseName: 'Bruce',
      age: 100,
      numberOfLegs: 3,
      hasTail: true,
    })
  ),
  S.chain(_ =>
    addHorseToStable({
      horseName: 'Buttery Ken',
      age: 48,
      numberOfLegs: 4,
      hasTail: true,
    })
  ),
  S.chain(_ =>
    addHorseToStable({
      horseName: 'Regular Ken',
      age: 49,
      numberOfLegs: 4,
      hasTail: false,
    })
  ),
  // remove non-standard horses
  S.chain(_ => standardiseHorses()),
  // get all our horses
  S.chain(_ => getHorses()),
  // and count them, returning the count
  S.map(horses => horses.length)
)

export const standardiseHorses = (): S.State<Stable, void> =>
  S.modify(stable => ({
    ...stable,
    horses: stable.horses.filter(
      horse => horse.hasTail && horse.numberOfLegs === 4
    ),
  }))

export const defaultStable: Stable = {
  name: 'Standard Horse Stable',
  horses: [],
}

const output = S.execute(defaultStable)(doHorseStuff)

// given a state value and the initial value, run it and get the state out
export const one = (
  state: S.State<number, string>,
  initialValue: number
): number => S.execState(state, initialValue)

// given a state value and the initial value, run it and get the value out
export const two = (
  state: S.State<number, string>,
  initialValue: number
): string => S.evalState(state, initialValue)

// return a state value that increments the number inside by one
export const three = (): S.State<number, void> => S.modify(a => a + 1)

// return a state value that returns the state as the value
export const four = <S>(): S.State<S, S> => S.get()
