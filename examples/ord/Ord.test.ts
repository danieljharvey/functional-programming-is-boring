import * as TL from './Ord'
import * as fc from 'fast-check'

const trafficLightArb: fc.Arbitrary<TL.TrafficLight> = fc.oneof(
  fc.constant(TL.red),
  fc.constant(TL.yellow),
  fc.constant(TL.yellowFlashing),
  fc.constant(TL.green)
)

describe('properties', () => {
  // the "zero" is always the lowest so does nothing
  it('a + zero == a', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        (tl) =>
          TL.trafficLightJoin.join(tl, TL.trafficLightJoin.zero) ===
          tl
      )
    )
  })

  it('a + green == green', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        (tl) => TL.trafficLightJoin.join(tl, TL.green) === TL.green
      )
    )
  })

  it('a + b == b + a', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        trafficLightArb,
        (tlA, tlB) =>
          TL.trafficLightJoin.join(tlA, tlB) ===
          TL.trafficLightJoin.join(tlB, tlA)
      )
    )
  })

  it('a + (b + c) == (a + b) + c', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        trafficLightArb,
        trafficLightArb,
        (tlA, tlB, tlC) =>
          TL.trafficLightJoin.join(
            tlA,
            TL.trafficLightJoin.join(tlB, tlC)
          ) ===
          TL.trafficLightJoin.join(
            TL.trafficLightJoin.join(tlA, tlB),
            tlC
          )
      )
    )
  })

  it('a + a == a', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        (tlA) => TL.trafficLightJoin.join(tlA, tlA) === tlA
      )
    )
  })

  it('a + b + b == a + b', () => {
    fc.assert(
      fc.property(
        trafficLightArb,
        trafficLightArb,
        (tlA, tlB) =>
          TL.trafficLightJoin.join(tlA, tlB) ===
          TL.trafficLightJoin.join(
            TL.trafficLightJoin.join(tlA, tlB),
            tlB
          )
      )
    )
  })
})
