import * as fc from "fast-check";
import {
  pure,
  runContinuationToPromise,
  map,
  ap,
  bind
} from "../lesson4-continuations";

describe("Continuation", () => {
  it.skip("Pure works", async () => {
    const result = await runContinuationToPromise(pure("dog"));
    expect(result).toEqual("dog");
  });
  it.skip("Obeys associativity", async () => {
    await fc.assert(
      fc.asyncProperty(fc.anything(), async a => {
        const value = map(a => a, pure(a));
        const output = await runContinuationToPromise(value);
        expect(output).toEqual(a);
      })
    );
  });
  it.skip("Obeys composition", async () => {
    const f = (a: number): string => `---${a}---`;
    const g = (s: string): string => `${s}${s}`;

    await fc.assert(
      fc.asyncProperty(fc.integer(), async a => {
        const value1 = map(g, map(f, pure(a)));
        const output1 = await runContinuationToPromise(value1);
        const value2 = map(a => g(f(a)), pure(a));
        const output2 = await runContinuationToPromise(value2);
        expect(output1).toEqual(output2);
      })
    );
  });

  it.skip("Obeys applicative identity", async () => {
    const id = <A>(a: A): A => a;
    await fc.assert(
      fc.asyncProperty(fc.anything(), async (a: any) => {
        const value = ap(pure(id), pure(a));
        const output = await runContinuationToPromise(value);
        expect(output).toEqual(a);
      })
    );
  });

  it.skip("Obeys applicative composition", async () => {
    const v = pure((a: number) => `---${a}---`);
    const u = pure((s: string) => `${s}${s}`);
    const compose = <B, C>(f: (b: B) => C) => <A>(g: (a: A) => B) => (
      a: A
    ): C => f(g(a));
    await fc.assert(
      fc.asyncProperty(fc.integer(), async (a: number) => {
        const w = pure(a);
        const pureCompose = pure(compose);
        const value1 = ap(ap(ap(pureCompose, u as any), v as any), w);
        const value2 = ap(u, ap(v, w));
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        expect(output1).toEqual(output2);
      })
    );
  });

  it.skip("Obeys homomorphism law", async () => {
    const f = (a: number) => a + 2;
    await fc.assert(
      fc.asyncProperty(fc.integer(), async a => {
        const value1 = ap(pure(f), pure(a));
        const value2 = pure(f(a));
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        return expect(output1).toEqual(output2);
      })
    );
  });

  it.skip("Obeys interchange law", async () => {
    const f = (a: any): [any, any, any] => [a, a, a];
    await fc.assert(
      fc.asyncProperty(fc.anything(), async a => {
        const value1 = ap(pure(f), pure(a));
        // forgive these sloppy types, it is hard to explain this to TS
        const value2 = ap(
          pure((g: (a: any) => any) => g(a)),
          pure(f)
        );
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        return expect(output1).toEqual(output2);
      })
    );
  });

  it.skip("Has working bind", async () => {
    const f = (a: string) => pure(`${a}horses${a}`);
    const a = "dog";
    const value = bind(f, pure(a));
    const output = await runContinuationToPromise(value);
    const expected = "doghorsesdog";
    expect(output).toEqual(expected);
  });

  // ie, pure does nothing interesting pt 1
  it.skip("Obeys left identity law", async () => {
    const f = a => pure([a, a]);
    await fc.assert(
      fc.asyncProperty(fc.string(), async a => {
        const value1 = bind(f, pure(a));
        const value2 = f(a);
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        return expect(output1).toEqual(output2);
      })
    );
  });
  // ie, pure does nothing interesting pt 2
  it.skip("Obeys right identity law", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async a => {
        const value1 = bind(pure, pure(a));
        const value2 = pure(a);
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        return expect(output1).toEqual(output2);
      })
    );
  });

  // ie, nesting doesn't matter
  it.skip("Obeys monad associativity law", async () => {
    const f = a => pure([a, a]);
    const g = a => pure(a + 2);
    await fc.assert(
      fc.asyncProperty(fc.integer(), async a => {
        const value1 = bind(f, bind(g, pure(a)));
        const value2 = bind(b => bind(f, g(b)), pure(a));
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        return expect(output1).toEqual(output2);
      })
    );
  });
});
