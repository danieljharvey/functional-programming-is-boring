import * as M from 'fp-ts/Monoid'
import * as B from 'fp-ts/Bounded'
import { flow } from 'fp-ts/function'
import * as Arr from 'fp-ts/Array'
import * as O from 'fp-ts/Option'

// A Monoid describes a way of combining values
// A Monoid<number> could describe adding two numbers, or multiplying them

// add up all the passed numbers
export const one: (as: number[]) => number = M.fold(M.monoidSum)

// multiply all the passed numbers
export const two: (as: number[]) => number = M.fold(M.monoidProduct)

// combine all passed strings together
export const three: (as: string[]) => string = M.fold(M.monoidString)

// return true if any of the provided values are true
export const four: (as: boolean[]) => boolean = M.fold(M.monoidAny)

// return true if all of the provided values are true
export const five: (as: boolean[]) => boolean = M.fold(M.monoidAll)

type Coord = { x: number; y: number }

// combine an array of co-ordinate points by adding
export const six: (points: Coord[]) => Coord = M.fold(
  M.getStructMonoid({ x: M.monoidSum, y: M.monoidSum })
)

// get the largest number in an array of numbers
export const seven: (as: number[]) => number = M.fold(
  M.getJoinMonoid(B.boundedNumber)
)

// get the smallest number in an array of numbers
export const eight: (as: number[]) => number = M.fold(
  M.getMeetMonoid(B.boundedNumber)
)

// the range is the minimum and maximum number in a set
type Range = [number, number]

// get the range for an array of numbers
export const nine: (as: number[]) => Range = flow(
  Arr.map(a => [a, a] as Range),
  M.fold(
    M.getTupleMonoid(
      M.getMeetMonoid(B.boundedNumber),
      M.getJoinMonoid(B.boundedNumber)
    )
  )
)

// given a list of Option values, return the first Some
export const ten: <A>(as: O.Option<A>[]) => O.Option<A> = M.fold(
  O.getFirstMonoid()
)

type Person = {
  name: string
  age: number
}

const lastMonoid: M.Monoid<string> = {
  empty: '',
  concat: (_, b) => b,
}

// given a list of Option<Person>, combine all Somes by adding the ages and
// keeping the last name
// you will need to make your own Monoid<string> to help
export const eleven: (
  people: O.Option<Person>[]
) => O.Option<Person> = M.fold(
  O.getMonoid(
    M.getStructMonoid({ name: lastMonoid, age: M.monoidSum })
  )
)

// given an array of predicates (that take a number and return a boolean)
// combine them into one predicate that, given one number, returns true if all the
// predicates pass, and false otherwise
export const twelve: (
  predicates: ((a: number) => boolean)[]
) => (a: number) => boolean = M.fold(
  M.getFunctionMonoid(M.monoidAll)()
)
