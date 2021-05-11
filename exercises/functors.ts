// a Functor is a type that has some sort of `A` in it, that we can change for some `B` without messing up the structure.

// Take an array: [1,2,3]

// using the built in `map` function, we can increment all the numbers inside it

export const exampleOne = [1, 2, 3].map(String)
// console.log({ exampleOne }) // == ["1","2","3"]

// what's happened here?

// we turned Array<number> into Array<string>

// what else do we notice?

// the result is still an array

// the array has the same length

export const id = <A>(a: A) => a

// the `id` function is a special one, look what happens when we map it over our array:

export const exampleTwo = [1, 2, 3].map(id)
// console.log({ exampleTwo }) // == [1,2,3]

// that's right, nothing!

// now let's say that we have two things we want to do to our array

export const double = (a: number) => a * 2

export const numToString = (b: number) => String(b)

export const exampleThree = [1, 2, 3].map(double).map(numToString)
// console.log({ exampleThree }) // == ["2","4","6"]

// seems fine, but perhaps a little inefficient. what if we do one map, but run both functions together?

export const exampleFour = [1, 2, 3].map(a => numToString(double(a)))
// console.log({ exampleFour }) // == ["2","4","6"]

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

// console.log(identityMap(a => a + 1, identity(1))) // identity(2)
// console.log(identityMap(id, identity(1))) // identity(1)

// here is your first one:
// Maybe optionally contains an `A`, so if there is one, we should run the
// function over it.

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

// here is the second one:
// Either<E,A> contains an `E` or an `A`. The `map` function should only affect
// the `A`, any `E` values should be left as they are

type Either<E, A> =
  | { type: 'Left'; left: E }
  | { type: 'Right'; right: A }

export const right = <A>(right: A): Either<never, A> => ({
  type: 'Right',
  right,
})

export const left = <E>(left: E): Either<E, never> => ({
  type: 'Left',
  left,
})

export const eitherMap = <E, A, B>(
  f: (a: A) => B,
  either: Either<E, A>
): Either<E, B> =>
  either.type === 'Right' ? right(f(either.right)) : either

// here is the third one:
// Pair<A,B> = [A,B]
// the functor should map over `B` and leave `A` alone

type Pair<A, B> = [A, B]

export const pairMap = <A, B, C>(
  f: (b: B) => C,
  [a, b]: Pair<A, B>
): Pair<A, C> => [a, f(b)]

// the fourth one is a Tree
// `map` should change all `A` values to `B`s
type Tree<A> =
  | { type: 'Leaf' }
  | { type: 'Branch'; left: Tree<A>; value: A; right: Tree<A> }

export const leaf: Tree<never> = { type: 'Leaf' }

export const branch = <A>(
  left: Tree<A>,
  value: A,
  right: Tree<A>
): Tree<A> => ({
  type: 'Branch',
  left,
  value,
  right,
})

export const treeMap = <A, B>(
  f: (a: A) => B,
  tree: Tree<A>
): Tree<B> =>
  tree.type === 'Leaf'
    ? tree
    : branch(
        treeMap(f, tree.left),
        f(tree.value),
        treeMap(f, tree.right)
      )

// here is the fifth one
// Reader<R,A>

// when the environment `R` is received, we will get an `A`, which we should
// then turn into a `B` using the provided function.

export type Reader<R, A> = { type: 'Reader'; runReader: (r: R) => A }

export const reader = <R, A>(
  runReader: (r: R) => A
): Reader<R, A> => ({
  type: 'Reader',
  runReader,
})

export const readerMap = <R, A, B>(
  f: (a: A) => B,
  value: Reader<R, A>
): Reader<R, B> => reader(r => f(value.runReader(r)))

// here the sixth one.
// what about asynchronous stuff?

// Task<A> represents an `A` that will appear in the future
// when it does, the `map` function will need to turn it into a `B` using
// the passed function

export type Task<A> = {
  type: 'Task'
  runTask: (next: (a: A) => void) => void
}

// create a Task
export const task = <A>(
  runTask: (next: (a: A) => void) => void
): Task<A> => ({
  type: 'Task',
  runTask,
})

// create a Task that immediately resolves to `A` (equivalent to
// Promise.resolve)
export const taskOf = <A>(a: A): Task<A> => task(next => next(a))

export const taskMap = <A, B>(
  f: (a: A) => B,
  value: Task<A>
): Task<B> => task(next => value.runTask(a => next(f(a))))
