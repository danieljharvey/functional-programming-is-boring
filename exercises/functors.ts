// a Functor is a type that has some sort of `A` in it, that we can change for some `B` without messing up the structure.

// Take an array: [1,2,3]

// using the built in `map` function, we can increment all the numbers inside it

const exampleOne = [1, 2, 3].map(String)
console.log({ exampleOne }) // == ["1","2","3"]

// what's happened here?

// we turned Array<number> into Array<string>

// what else do we notice?

// the result is still an array

// the array has the same length

export const id = <A>(a: A) => a

// the `id` function is a special one, look what happens when we map it over our array:

const exampleTwo = [1, 2, 3].map(id)
console.log({ exampleTwo }) // == [1,2,3]

// that's right, nothing!

// now let's say that we have two things we want to do to our array

export const double = (a: number) => a * 2

export const numToString = (b: number) => String(b)

const exampleThree = [1, 2, 3].map(double).map(numToString)
console.log({ exampleThree }) // == ["2","4","6"]

// seems fine, but perhaps a little inefficient. what if we do one map, but run both functions together?

const exampleFour = [1, 2, 3].map(a => numToString(double(a)))
console.log({ exampleFour }) // == ["2","4","6"]

// the answer is the same. What a relief.

// we're going to write some map functions for various data structures to get an intuition for functors as a concept

// the map function has a type signature of
// map = <A,B>(fn: (a:A) =>B, value: SomeFunctor<A>): SomeFunctor<B>

// here is a simple one to start
type Identity<A> = { type: 'Identity'; value: A }

export const identity = <A>(value: A): Identity<A> => ({
  type: 'Identity',
  value,
})

export const identityMap = <A, B>(
  f: (a: A) => B,
  input: Identity<A>
): Identity<B> => identity(f(input.value))

console.log(identityMap(a => a + 1, identity(1))) // identity(2)
console.log(identityMap(id, identity(1))) // identity(1)

// here is your first one:

type Maybe<A> = { type: 'Just'; value: A } | { type: 'Nothing' }

export const just = <A>(value: A): Maybe<A> => ({
  type: 'Just',
  value,
})
export const nothing: Maybe<never> = { type: 'Nothing' }

export const maybeMap = <A, B>(
  f: (a: A) => B,
  maybe: Maybe<A>
): Maybe<B> =>
  maybe.type === 'Just' ? just(f(maybe.value)) : nothing
