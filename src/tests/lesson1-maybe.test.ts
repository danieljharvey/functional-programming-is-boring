import {
  just,
  nothing,
  map,
  bind,
  orElse,
  newGetHorse,
  newMandatoryTailCheck,
  newHorseFinder,
  standardHorses
} from "../lesson1-maybe";

describe("Maybe", () => {
  it.skip("Just", () => {
    expect(just(1)).toEqual({ type: "Just", value: 1 });
  });
  it.skip("Nothing", () => {
    expect(nothing()).toEqual({ type: "Nothing" });
  });
  it.skip("Map", () => {
    expect(map((a: number) => a + 1, nothing())).toEqual(nothing());
    expect(map((a: number) => a + 1, just(1))).toEqual(just(2));
  });
  it.skip("Bind", () => {
    expect(bind((a: number) => just(a + 1), nothing())).toEqual(nothing());
    expect(bind((a: number) => just(a + 1), just(1))).toEqual(just(2));
    expect(bind((_: number) => nothing(), just(1))).toEqual(nothing());
  });
  it.skip("orElse", () => {
    expect(orElse((a: number) => a + 1, 0, just(1))).toEqual(2);
    expect(orElse((a: number) => a + 1, 0, nothing())).toEqual(0);
  });
  it.skip("newGetHorse", () => {
    expect(newGetHorse("CHAMPION")).toEqual(just(standardHorses[0]));
    expect(newGetHorse("CHOMPION")).toEqual(nothing());
  });
  it.skip("newMandatoryTailCheck", () => {
    const passHorse = standardHorses[1];
    expect(newMandatoryTailCheck(passHorse).type).toEqual("Just");
    const failHorse = standardHorses[0];
    expect(newMandatoryTailCheck(failHorse)).toEqual(nothing());
  });
  it.skip("newHorseFinder", () => {
    expect(newHorseFinder("HOOVES_GALORE")).toEqual(
      "Found a good horse named hooves_galore"
    );
    expect(newHorseFinder("CHOMPION")).toEqual("CHOMPION is not a good horse");
  });
});
