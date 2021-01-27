import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

// fetch an item from an array, taking into account might not be there
export const safeListGet = <A>(index: number, as: A[]): O.Option<A> =>
  O.fromNullable(as[index])

// an array of strings
export const things = ['dog', 'log', 'hog', 'pog']

safeListGet(0, things) // Some("dog")
safeListGet(7, things) // None

// what if we want to fetch a bunch of items and only continue if they
// are all there?
export const getManyThings = <A>(
  indexes: number[],
  as: A[]
): O.Option<readonly A[]> => {
  // an array of things that may or not be there
  const optionThings: O.Option<A>[] = indexes.map(i =>
    safeListGet(i, as)
  )
  // change it to either the whole array or nothing
  return O.sequenceArray(optionThings)
}

getManyThings([3, 2, 1, 0], things) // Some(['pog', 'hog', 'log', 'dog'])
getManyThings([3, 2, 1, 0, -1], things) // None

// piping an Option through multiple functions

// what if for some explicable reason we want to get something from the list
// and then make it SHOUTED!!! ?
export const listGetLoud = (index: number): O.Option<string> =>
  pipe(
    safeListGet(index, things), // get an Option<string>
    O.map(str => str.toUpperCase()), // if there's a string, uppercase it
    O.map(str => `${str}!!!`) // if there's a string, add spicy punctuation
  )

listGetLoud(0) // Some('DOG!!!')
listGetLoud(-1) // None
