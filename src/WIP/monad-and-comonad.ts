import * as E from 'fp-ts/Either'
import * as NE from 'fp-ts/NonEmptyArray'
// monad

// pure :: (Monad m) => a -> m a

// we can always put something in a Monad

// Either e a = e | a

// cardinality of Bool is 2

type Light = 'red' | 'green' | 'blue'

// sum type
type Poo = E.Either<Boolean, Light>
// cardinality

// cardinality of "red'" | "green " | "blue " is 3

// sum type = e + a

// comonad

// you can always get something out

// extract :: (Comonad w) => w a -> a

// Pair e a = (e && a)
// 6

const things: NE.NonEmptyArray<number> = NE.cons(1, [2, 3, 4, 5])
