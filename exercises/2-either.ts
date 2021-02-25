import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

// Either lets us represent either a Left or Right item
//
// Usually the `Left` item represents some sort of error state
// and the `Right` represents success
//
// Think of it as a classier way to return errors

// Given an Either<Error, number>, get the value inside or return null,
// ignoring the error
export const one = (
  value: E.Either<Error, number>
): number | null => {
  return E.getOrElseW(() => null)(value)
}

// Given an Either<Error, string>, run the provided function on the string
export const two = (
  f: (a: string) => number,
  value: E.Either<Error, string>
): E.Either<Error, number> => pipe(value, E.map(f))

// Given an Either<number, string>, double the value in the `Left` if it is
// there
export const three = (
  value: E.Either<number, string>
): E.Either<number, string> =>
  pipe(
    value,
    E.mapLeft(a => a * 2)
  )

export type Response = {
  statusCode: number
  body: string
}

// Given an Either<Error, string>, return a Response with either a `200`
// statusCode for success, or a `500` statusCode on failure
export const four = (value: E.Either<Error, string>): Response =>
  pipe(
    value,
    E.fold(
      e => ({ statusCode: 500, body: e.message }),
      a => ({ statusCode: 200, body: a })
    )
  )

// Given a function that might throw or return a number, make
// the function return an Either instead with the error message in the `Left`
export const five = (
  badFunction: () => number
): E.Either<string, number> =>
  E.tryCatch(badFunction, e => (e as Error)?.message || '')

// Given an Option<A> and an error message, return the `A` or the error message
export const six = <E, A>(
  option: O.Option<A>,
  error: E
): E.Either<E, A> =>
  pipe(
    option,
    E.fromOption(() => error)
  )

// Given an array of Either<E,A>, split them into one array of Es and one of
// As
export const seven = <E, A>(eithers: E.Either<E, A>[]): [E[], A[]] =>
  eithers.reduce(
    ([arrE, arrA], either) =>
      pipe(
        either,
        E.fold(
          e => [[...arrE, e], arrA],
          a => [arrE, [...arrA, a]]
        )
      ),
    [[] as E[], [] as A[]]
  )
