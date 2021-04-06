import * as W from 'fp-ts/Writer'
import * as Arr from 'fp-ts/Array'
import { pipe, pipeable } from 'fp-ts/pipeable'
import * as B from 'fp-ts/Bounded'

// The Writer type lets us accumulate values along with another computation
// the W type in Writer<W,A> must be a Monoid so we know how to combibe them
// the A is the return type

// our logMonoid collects an array of strings
const logMonoid = Arr.getMonoid<string>()

// Writer using logMonoid to combine it's entries
export const logWriterM = W.getMonad(logMonoid)

// all our functions for dealing with our Writer
const { map, chainFirst, ap } = pipeable(logWriterM)

// given a value, wrap it in our log writer
export const one = <A>(a: A): W.Writer<string[], A> =>
  undefined as any

// given a logWriter value, double the number inside
export const two = (
  value: W.Writer<string[], number>
): W.Writer<string[], number> => undefined as any

// given a logWriter value, return the number inside
export const three = (value: W.Writer<string[], number>): number =>
  undefined as any

// given a logWriter value, return the logs
export const four = (value: W.Writer<string[], number>): string[] =>
  undefined as any

// given a log and a logWriter value, add the value to the log
export const five = (log: string) => (
  value: W.Writer<string[], number>
): W.Writer<string[], number> => undefined as any

// given a function from a -> b -> c, a Writer<string[],A> and a
// Writer<string[], B>, return a Writer<string[],C>
export const six = <A, B, C>(
  f: (a: A) => (b: B) => C,
  writeA: W.Writer<string[], A>,
  writeB: W.Writer<string[], B>
): W.Writer<string[], C> => undefined as any
