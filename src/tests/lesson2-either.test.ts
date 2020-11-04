import {
  Horse,
  left,
  right,
  map,
  bind,
  matchEither,
  standardise,
  horseFinder
} from "../lesson2-either";

describe("Either", () => {
  it("Right", () => {
    expect(right(1)).toEqual({ type: "Right", value: 1 });
  });
  it("Left", () => {
    expect(left("horse")).toEqual({ type: "Left", value: "horse" });
  });
  it("Map", () => {
    expect(map((a: number) => a + 1, left("dog"))).toEqual(left("dog"));
    expect(map((a: number) => a + 1, right(1))).toEqual(right(2));
  });
  it("Bind", () => {
    expect(bind((a: number) => right(a + 1), left("Oh"))).toEqual(left("Oh"));
    expect(bind((a: number) => right(a + 1), right(1))).toEqual(right(2));
    expect(bind((_: number) => left("oh"), right(1))).toEqual(left("oh"));
  });
  it("matchEither", () => {
    const leftFn = (_e: string) => "oh no";
    const rightFn = (x: number) => `${x}`;

    expect(matchEither(leftFn, rightFn, left("dog"))).toEqual("oh no");
    expect(matchEither(leftFn, rightFn, right(100))).toEqual("100");
  });
  it("standardise", () => {
    const basicHorse: Horse = {
      type: "HORSE",
      name: "Bruce",
      legs: 4,
      hasTail: true
    };
    expect(standardise(basicHorse)).toEqual(
      right({ ...basicHorse, type: "STANDARD_HORSE" })
    );
    expect(standardise({ ...basicHorse, hasTail: false })).toEqual(
      left({ type: "HAS_NO_TAIL" })
    );
    expect(standardise({ ...basicHorse, legs: 3 })).toEqual(
      left({ type: "NOT_ENOUGH_LEGS" })
    );
    expect(standardise({ ...basicHorse, legs: 6 })).toEqual(
      left({ type: "TOO_MANY_LEGS" })
    );
  });
  it("horseFinder", () => {
    expect(horseFinder("HOOVES_GALORE")).toEqual(
      "What a good horse named Hooves_galore"
    );
    expect(horseFinder("CHAMPION")).toEqual(
      "You can see that it clearly has no tail"
    );
    expect(horseFinder("CHOMPION")).toEqual(
      "The horse CHOMPION cannot be found"
    );
  });
});
