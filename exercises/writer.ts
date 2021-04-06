import * as W from 'fp-ts/Writer'
import * as Arr from 'fp-ts/Array'
import { pipe, pipeable } from 'fp-ts/pipeable'

// our logMonoid collects an array of strings
const logMonoid = Arr.getMonoid<string>()

// Writer using logMonoid to combine it's entries
export const logWriter = W.getMonad(logMonoid)

// all our functions for dealing with our Writer
const { map } = pipeable(logWriter)

// given a value, wrap it in our log writer
export const one = <A>(a: A): W.Writer<string[], A> => logWriter.of(a)

// given a logWriter value, double the number inside
export const two = (
  value: W.Writer<string[], number>
): W.Writer<string[], number> =>
  pipe(
    value,
    map(a => a * 2)
  )

// given a logWriter value, return the number inside
export const three = (value: W.Writer<string[], number>): number =>
  W.evaluate(value)
