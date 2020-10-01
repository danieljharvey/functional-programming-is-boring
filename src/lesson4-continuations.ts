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
export const pure = undefined as any;

// map :: (A -> B) -> Continuation A -> Continuation B
export const map = undefined as any;

// ap :: Continuation (A -> B) -> Continuation A -> Continuation B
export const ap = undefined as any;

// bind :: (A -> Continuation B) -> Continuation A -> Continuation B
export const bind = undefined as any;

// liftA2 :: (A -> B -> C) -> Continuation A -> Continuation B -> Continuation C
export const liftA2 = undefined as any;

// race :: Continuation A -> Continuation A -> Continuation A

// delay :: Int -> Continuation A -> Continuation

// withTimeout :: Int -> A -> Continuation A -> Continuation A
