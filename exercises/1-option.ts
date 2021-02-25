import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import * as S from 'fp-ts/Semigroup'
import * as M from 'fp-ts/Monoid'

// Option
//
// An Option<A> can either be a Some<A> or a None
//
// Consider an executive business class version of representing null

// if value is `null`, make it into a `None`, otherwise wrap the value in
// `Some`
export const one = (value: string | null): O.Option<string> =>
  undefined as any

// the same, but make it also wrap `undefined` in `None` as well
export const two = <A>(value: A | null | undefined): O.Option<A> =>
  undefined as any

// given an Option<string>, return the value or the default string `oh no`
export const three = (input: O.Option<string>): string =>
  undefined as any

// given an Option, return the value inside `Some` or `null`
export const four = <A>(input: O.Option<A>): A | null =>
  undefined as any

// Given an array, wrap the first item in `Some` or return `None` if it is
// empty
export const five = <A>(input: A[]): O.Option<A> => undefined as any

// Given an array, and a predicate for the items, return the first matching
// item wrapped in a `Some`, or `None` if nothing matches
export const six = <A>(
  input: A[],
  predicate: (a: A) => boolean
): O.Option<A> => undefined as any

// Given either an Option<number>, double the number if it is available
export const seven = (input: O.Option<number>): O.Option<number> =>
  undefined as any

// Given an array of strings and a function that turns each into an
// `Option<number>, return an array of all the numbers that it successfully
// made
export const eight = (
  input: string[],
  transform: (a: string) => O.Option<number>
): number[] => undefined as any

// Given a nested array, return the first item of the first array if it exists
export const nine = <A>(input: A[][]): O.Option<A> => undefined as any

// Given an array of Option<number>, add up all the numbers that are `Some`
export const ten = (input: O.Option<number>[]): number =>
  undefined as any

// given any `Semigroup` for `A`, use it to combine a list of options into one
// Option<A>
// hint: lookup `getMonoid` in the `fp-ts` docs for Option
export const eleven = <A>(
  input: O.Option<A>[],
  semigroup: S.Semigroup<A>
): O.Option<A> => undefined as any

// given a function that combines `A` and `B` into `C`, an Option<A> and an
// Option<B>, use it to return an Option<C>
export const twelve = <A, B, C>(
  f: (a: A) => (b: B) => C,
  optionA: O.Option<A>,
  optionB: O.Option<B>
): O.Option<C> => undefined as any

// Given a readonly array of Option<number>, if they are all `Some`, return `Some` with
// the array of numbers inside, otherwise, return `None`
export const thirteen = (
  input: ReadonlyArray<O.Option<number>>
): O.Option<ReadonlyArray<number>> => undefined as any
