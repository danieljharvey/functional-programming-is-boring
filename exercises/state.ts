import * as S from 'fp-ts/State'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Apply'
import { pipe } from 'fp-ts/function'

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
): number => undefined as any

// given a state value and the initial value, run it and get the value out
export const two = (
  state: S.State<number, string>,
  initialValue: number
): string => undefined as any

// return a state value that increments the number inside by one
export const three = (): S.State<number, void> => undefined as any

// return a state value that returns the state as the value
export const four = <S>(): S.State<S, S> => undefined as any

// return a function that takes a log message and stores it in state
export const five = (message: string): S.State<string[], void> =>
  undefined as any

// write a function that looks up a string key in a record and returns the
// value if it is there
export const six = (
  key: string
): S.State<Record<string, number>, O.Option<number>> =>
  undefined as any

// increment every number in the state by one
export const seven = (): S.State<number[], void> => undefined as any

// given a list of Horses, return all the Horses with an age of 10 or over
export const eight = (): S.State<Horse[], Horse[]> => undefined as any

// given two State values containing arrays, combine them, concatenating the
// arrays
// hint: take a look at SequenceT in 'fp-ts/Apply'
export const nine = <S, A>(
  a: S.State<S, A[]>,
  b: S.State<S, A[]>
): S.State<S, A[]> => undefined as any

// given a function that combines the values inside two State values, and two
// state values, combine them to create a new State value
// hint: search on the internet for the 'liftA2' function
export const ten = <S, A, B, C>(
  f: (a: A) => (b: B) => C,
  a: S.State<S, A>,
  b: S.State<S, B>
): S.State<S, C> => undefined as any

// given a value, and a function that changes state, make a state action that
// returns the action and makes the state change
export const eleven = <S, A>(a: A, fn: (s: S) => S): S.State<S, A> =>
  undefined as any
