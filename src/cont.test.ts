import * as fc from "fast-check";
import { pure, runContinuationToPromise, map, ap } from "./cont";

describe("Continuation", () => {
  it("Pure works", async () => {
    const result = await runContinuationToPromise(pure("dog"));
    expect(result).toEqual("dog");
  });
  it("Obeys associativity", () => {
    fc.assert(
      fc.asyncProperty(fc.anything(), async a => {
        const value = map(a => a, pure(a));
        const output = await runContinuationToPromise(value);
        expect(output).toEqual(a);
      })
    );
  });
  it("Obeys composition", () => {
    const f = (a: number): string => `---${a}---`;
    const g = (s: string): string => `${s}${s}`;

    fc.assert(
      fc.asyncProperty(fc.integer(), async a => {
        const value1 = map(g, map(f, pure(a)));
        const output1 = await runContinuationToPromise(value1);
        const value2 = map(a => g(f(a)), pure(a));
        const output2 = await runContinuationToPromise(value2);
        expect(output1).toEqual(output2);
      })
    );
  });

  it("Obeys applicative identity", () => {
    const id = <A>(a: A): A => a;
    fc.assert(
      fc.asyncProperty(fc.anything(), async (a: any) => {
        const value = ap(pure(id), pure(a));
        const output = await runContinuationToPromise(value);
        expect(output).toEqual(a);
      })
    );
  });

  it("Obeys applicative composition", () => {
    const v = pure((a: number) => `---${a}---`);
    const u = pure((s: string) => `${s}${s}`);
    const compose = <B, C>(f: (b: B) => C) => <A>(g: (a: A) => B) => (
      a: A
    ): C => f(g(a));
    fc.assert(
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

  it("Obeys homomorphism law", () => {
    const f = (a: number) => a + 2;
    fc.assert(
      fc.asyncProperty(fc.integer(), async a => {
        const value1 = ap(pure(f), pure(a));
        const value2 = pure(f(a));
        const output1 = await runContinuationToPromise(value1);
        const output2 = await runContinuationToPromise(value2);
        expect(output1).toEqual(output2);
      })
    );
  });
});
