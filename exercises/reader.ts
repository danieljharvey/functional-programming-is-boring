import * as R from 'fp-ts/Reader'
import * as M from 'fp-ts/Monoid'
import { pipe } from 'fp-ts/function'
import * as A from 'fp-ts/Apply'

// given an array of Reader values, return one return value with all the values
// inside summed
export const one = <R>(
  as: R.Reader<R, number>[]
): R.Reader<R, number> => pipe(as, M.fold(R.getMonoid(M.monoidSum)))

// given an array of Reader values, and a Monoid that knows how to combine the
// values, return a single Reader value with all the contents combined
export const two = <R, A>(
  as: R.Reader<R, A>[],
  monoid: M.Monoid<A>
): R.Reader<R, A> => pipe(as, M.fold(R.getMonoid(monoid)))

// given a function shaped `A` -> `B` -> `C`, a Reader<A> and a Reader<B>,
// return a Reader<C>
export const three = <R, A, B, C>(
  f: (a: A) => (b: B) => C,
  readerA: R.Reader<R, A>,
  readerB: R.Reader<R, B>
): R.Reader<R, C> => pipe(readerA, R.map(f), R.ap(readerB))

type Env = {
  translations: {
    greeting: string
    happyBirthday: string
    genericPleasantry: string
  }
  date: Date
}

const thingOne = (name: string) => ({ translations }: Env) =>
  `${translations.greeting}, ${name}!`

const thingTwo = (birthday: Date) => ({ date, translations }: Env) =>
  date.getMonth() == birthday.getMonth() &&
  date.getDate() == birthday.getDate()
    ? `${translations.happyBirthday}!`
    : `${translations.genericPleasantry}.`

// given the functions `thingOne` and `thingTwo`, combine them to make a
// function that creates a birthday greeting.
export const four = (
  name: string,
  birthday: Date
): R.Reader<Env, string> =>
  pipe(
    A.sequenceT(R.reader)(thingOne(name), thingTwo(birthday)),
    R.map(([a, b]) => `${a} ${b}`)
  )
