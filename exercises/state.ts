import * as S from 'fp-ts/State'
import * as O from 'fp-ts/Option'

// The state monad lets us store and update some state throughout a
// computation.
//
// This allows us to keep computations pure but still organise them in a more
// familiar way

export type Horse = {
  horseName: string
  age: number
  numberOfLegs: number
  hasTail: boolean
}

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

// return a function that takes a log message and stores it in state
export const five = (message: string): S.State<string[], void> =>
  S.modify(logs => [...logs, message])

// write a function that looks up a string key in a record and returns the
// value if it is there
export const six = (
  key: string
): S.State<Record<string, number>, O.Option<number>> =>
  S.gets(as => O.fromNullable(as[key]))

// increment every number in the state by one
export const seven = (): S.State<number[], void> =>
  S.modify(as => as.map(a => a + 1))

// given a list of Horses, return all the Horses with an age of 10 or over
export const eight = (): S.State<Horse[], Horse[]> =>
  S.gets(horses => horses.filter(h => h.age >= 10))
