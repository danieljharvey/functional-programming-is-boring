import * as fc from "fast-check";
import {
  pure,
  runReader,
  map,
  ap,
  bind,
  liftA2,
  horseInformation,
  read1,
  read2,
  read3,
  read4,
  acceptableHorsesCheck
} from "../lesson5-reader";

const environment = { name: "Mr Horse", age: 100 };

describe("Reader Part 1", () => {
  it("Reader test 1", () => {
    expect(runReader(horseInformation, read1)).toEqual("Horses");
  });

  it("Reader test 2", () => {
    expect(runReader(horseInformation, read2)).toEqual("HORSES");
  });

  it("Reader test 3", () => {
    expect(runReader(horseInformation, read3)).toEqual({
      type: "Nothing"
    });
  });

  it("Reader test 4", () => {
    expect(runReader(horseInformation, read4)).toEqual(
      "HOOVES GALORE is an acceptable horse"
    );
  });

  it("Pure works", () => {
    const result = runReader(environment, pure("dog"));
    expect(result).toEqual("dog");
  });
  it("Obeys associativity", () => {
    fc.assert(
      fc.property(fc.anything(), a => {
        const value = map((a: any) => a, pure(a));
        const output = runReader(environment, value);
        expect(output).toEqual(a);
      })
    );
  });
  it("Obeys composition", () => {
    const f = (a: number): string => `---${a}---`;
    const g = (s: string): string => `${s}${s}`;

    fc.assert(
      fc.property(fc.integer(), a => {
        const value1 = map(g, map(f, pure(a)));
        const output1 = runReader(environment, value1);
        const value2 = map((a: any) => g(f(a)), pure(a));
        const output2 = runReader(environment, value2);
        expect(output1).toEqual(output2);
      })
    );
  });

  it("Has working bind", () => {
    const f = (a: string) => pure(`${a}horses${a}`);
    const a = "dog";
    const value = bind(f, pure(a));
    const output = runReader(environment, value);
    const expected = "doghorsesdog";
    expect(output).toEqual(expected);
  });

  // ie, pure does nothing interesting pt 1
  it("Obeys left identity law", () => {
    const f = <A>(a: A) => pure([a, a]);
    fc.assert(
      fc.property(fc.string(), a => {
        const value1 = bind(f, pure(a));
        const value2 = f(a);
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        return expect(output1).toEqual(output2);
      })
    );
  });
  // ie, pure does nothing interesting pt 2
  it("Obeys right identity law", () => {
    fc.assert(
      fc.property(fc.string(), a => {
        const value1 = bind(pure, pure(a));
        const value2 = pure(a);
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        return expect(output1).toEqual(output2);
      })
    );
  });

  // ie, nesting doesn't matter
  it("Obeys monad associativity law", () => {
    const f = <A>(a: A) => pure([a, a]);
    const g = (a: number) => pure(a + 2);
    fc.assert(
      fc.property(fc.integer(), a => {
        const value1 = bind(f, bind(g, pure(a)));
        const value2 = bind((b: any) => bind(f, g(b)), pure(a));
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        return expect(output1).toEqual(output2);
      })
    );
  });
});

describe("Reader Part 2", () => {
  it("Obeys applicative identity", () => {
    const id = <A>(a: A): A => a;
    fc.assert(
      fc.property(fc.anything(), (a: any) => {
        const value = ap(pure(id), pure(a));
        const output = runReader(environment, value);
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
      fc.property(fc.integer(), (a: number) => {
        const w = pure(a);
        const pureCompose = pure(compose);
        const value1 = ap(ap(ap(pureCompose, u as any), v as any), w);
        const value2 = ap(u, ap(v, w));
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        expect(output1).toEqual(output2);
      })
    );
  });

  it("Obeys homomorphism law", () => {
    const f = (a: number) => a + 2;
    fc.assert(
      fc.property(fc.integer(), a => {
        const value1 = ap(pure(f), pure(a));
        const value2 = pure(f(a));
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        return expect(output1).toEqual(output2);
      })
    );
  });

  it("Obeys interchange law", () => {
    const f = (a: any): [any, any, any] => [a, a, a];
    fc.assert(
      fc.property(fc.anything(), a => {
        const value1 = ap(pure(f), pure(a));
        // forgive these sloppy types, it is hard to explain this to TS
        const value2 = ap(
          pure((g: (a: any) => any) => g(a)),
          pure(f)
        );
        const output1 = runReader(environment, value1);
        const output2 = runReader(environment, value2);
        return expect(output1).toEqual(output2);
      })
    );
  });
  it("liftA2", () => {
    const f = <A, B>(a: A, b: B) => [a, b];
    fc.assert(
      fc.property(fc.anything(), fc.anything(), (a, b) => {
        const value = liftA2(f, pure(a), pure(b));
        const output = runReader(environment, value);
        return expect(output).toEqual([a, b]);
      })
    );
  });

  it("Reader test 5 part 1", () => {
    expect(
      runReader(horseInformation, acceptableHorsesCheck(["Steve Bannon"]))
    ).toEqual("No good horses here I am afraid");
  });

  it("Reader test 5 part 2", () => {
    expect(
      runReader(
        horseInformation,
        acceptableHorsesCheck(["Steve Bannon", "CHAMPION", "HOOVES GALORE"])
      )
    ).toEqual(
      "CHAMPION is an acceptable horse, HOOVES GALORE is an acceptable horse"
    );
  });
});
