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
  it("Just", () => {
    expect(just(1)).toEqual({ type: "Just", value: 1 });
  });
  it("Nothing", () => {
    expect(nothing()).toEqual({type: "Nothing"})
  })
  it("Map", () => {
    expect(map(a => a + 1, nothing())).toEqual(nothing())
    expect(map(a => a + 1, just(1))).toEqual(just(2))
  })
  it("Bind", () => {
    expect(bind(a => just(a + 1),nothing())).toEqual(nothing()) 
    expect(bind(a => just(a + 1),just(1))).toEqual(just(2)) 
    expect(bind(_ => nothing(),just(1))).toEqual(nothing())
  })
  it("orElse",() => {
    expect(orElse(a => a +1,0,just(1))).toEqual(2)
    expect(orElse(a => a +1,0,nothing())).toEqual(0)
  })
  it("newGetHorse", () => {
    expect(newGetHorse("CHAMPION")).toEqual(just(standardHorses[0]))
    expect(newGetHorse("CHOMPION")).toEqual(nothing())
  })
  it("newMandatoryTailCheck", () => {
    const passHorse = standardHorses[1]
    expect(newMandatoryTailCheck(passHorse).type).toEqual('Just')
    const failHorse = standardHorses[0]
    expect(newMandatoryTailCheck(failHorse)).toEqual(nothing())
  })
  it('newHorseFinder', () => {
    expect(newHorseFinder('HOOVES_GALORE')).toEqual('Found a good horse named hooves_galore')
    expect(newHorseFinder('CHOMPION')).toEqual('CHOMPION is not a good horse')
  })
});
