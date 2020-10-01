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

// pure :: A -> Continuation A
export const pure = <A>(a: A): Continuation<A> =>
  continuation(next => next(a));

// map :: (A -> B) -> Continuation A -> Continuation B
export const map = <A, B>(
  f: (a: A) => B,
  value: Continuation<A>
): Continuation<B> =>
  continuation(next => value.runContinuation(a => next(f(a))));

// ap :: Continuation (A -> B) -> Continuation A -> Continuation B
export const ap = <A, B>(
  fAB: Continuation<(a: A) => B>,
  a: Continuation<A>
): Continuation<B> =>
  continuation<B>(next =>
    fAB.runContinuation((f: (a: A) => B) =>
      a.runContinuation((a: A) => next(f(a)))
    )
  );

// bind :: (A -> Continuation B) -> Continuation A -> Continuation B
export const bind = <A, B>(
  aToFB: (a: A) => Continuation<B>,
  value: Continuation<A>
): Continuation<B> =>
  continuation<B>(next =>
    value.runContinuation(a => aToFB(a).runContinuation(b => next(b)))
  );

// liftA2 :: (A -> B -> C) -> Continuation A -> Continuation B -> Continuation C
export const liftA2 = <A, B, C>(
  f: (a: A) => (b: B) => C,
  contA: Continuation<A>,
  contB: Continuation<B>
): Continuation<C> => ap(map(f, contA), contB);

// liftA3 :: (A -> B -> C -> D) -> Continuation A -> Continuation B -> Continuation C -> Continuation D
export const liftA3 = <A, B, C, D>(
  f: (a: A) => (b: B) => (c: C) => D,
  contA: Continuation<A>,
  contB: Continuation<B>,
  contC: Continuation<C>
): Continuation<D> => ap(ap(map(f, contA), contB), contC);

// pair :: Continuation A -> Continuation B -> Continuation<[A,B]>

// race :: Continuation A -> Continuation A -> Continuation A

// delay :: Int -> Continuation A -> Continuation

// withTimeout :: Int -> A -> Continuation A -> Continuation A
