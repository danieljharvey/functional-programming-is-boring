import * as R from 'fp-ts/Reader'
import * as M from 'fp-ts/Monoid'
import { pipe } from 'fp-ts/function'

export const one = <R>(
  as: R.Reader<R, number>[]
): R.Reader<R, number> => pipe(as, M.fold(R.getMonoid(M.monoidSum)))

export const two = <R, A>(
  as: R.Reader<R, A>[],
  monoid: M.Monoid<A>
): R.Reader<R, A> => pipe(as, M.fold(R.getMonoid(monoid)))

export const three = <R, A, B, C>(
  f: (a: A) => (b: B) => C,
  readerA: R.Reader<R, A>,
  readerB: R.Reader<R, B>
): R.Reader<R, C> => pipe(readerA, R.map(f), R.ap(readerB))
