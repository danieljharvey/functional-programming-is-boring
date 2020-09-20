export type Continuation<A> = {
  type: "Continuation";
  runContinuation: (next: (a: A) => void) => void;
};

export const runContinuationToPromise = <A>(
  value: Continuation<A>
): Promise<A> =>
  new Promise(resolve => {
    value.runContinuation(resolve);
  });

const continuation = <A>(
  runContinuation: (next: (a: A) => void) => void
): Continuation<A> => ({
  type: "Continuation",
  runContinuation
});

export const pure = <A>(a: A): Continuation<A> =>
  continuation(next => next(a));

export const map = <A, B>(
  f: (a: A) => B,
  value: Continuation<A>
): Continuation<B> =>
  continuation(next => value.runContinuation(a => next(f(a))));

export const ap = <A, B>(
  fAB: Continuation<(a: A) => B>,
  a: Continuation<A>
): Continuation<B> =>
  continuation<B>(next =>
    fAB.runContinuation((f: (a: A) => B) =>
      a.runContinuation((a: A) => next(f(a)))
    )
  );
