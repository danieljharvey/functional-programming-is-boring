import * as fc from 'fast-check'
import {
  Semigroup,
  monoidArray,
  monoidString,
  Monoid,
  monoidAnd,
  Option,
  Nothing,
  Just,
  just,
  nothing,
  monoidOptionString,
  monoidOptionSum,
  monoidFirst,
} from '../lesson3-semigroups-monoids'

// cope better with javascript's terrible notion of equality
const eq = <A>(a: A, b: A): boolean =>
  JSON.stringify(a) === JSON.stringify(b)

const isAssociative = <A>(
  semigroup: Semigroup<A>,
  one: A,
  two: A,
  three: A
): boolean =>
  eq(
    semigroup.append(semigroup.append(one, two), three),
    semigroup.append(one, semigroup.append(two, three))
  )

describe.skip('Array monoid', () => {
  it('Combines two arrays', () => {
    expect(monoidArray().append([1, 2, 3], [4, 5])).toEqual([
      1,
      2,
      3,
      4,
      5,
    ])
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        fc.array(fc.integer()),
        fc.array(fc.integer()),
        (a, b, c) => {
          expect(isAssociative(monoidArray(), a, b, c)).toBeTruthy()
        }
      )
    )
  })
})

describe.skip('String monoid', () => {
  it('Combines two strings', () => {
    expect(monoidString.append('hor', 'se')).toEqual('horse')
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.string(),
        (a, b, c) => {
          expect(isAssociative(monoidString, a, b, c)).toBeTruthy()
        }
      )
    )
  })
})

const hasIdentity = <A>(monoid: Monoid<A>, value: A): boolean =>
  eq(monoid.append(value, monoid.empty), value) &&
  eq(monoid.append(monoid.empty, value), value)

describe.skip('And monoid', () => {
  it('Combines two booleans', () => {
    expect(monoidAnd.append(true, false)).toEqual(false)
    expect(monoidAnd.append(true, true)).toEqual(true)
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (a, b, c) => {
          expect(isAssociative(monoidAnd, a, b, c)).toBeTruthy()
        }
      )
    )
  })
  it('Has a working identity value', () => {
    fc.assert(
      fc.property(fc.boolean(), (a) => {
        expect(hasIdentity(monoidAnd, a)).toBeTruthy()
      })
    )
  })
})

const justArbitrary = <A>(
  arb: fc.Arbitrary<A>
): fc.Arbitrary<Just<A>> =>
  fc.record<Just<A>>({
    type: fc.constant('Just'),
    value: arb,
  })

const nothingArbitrary: fc.Arbitrary<Nothing> = fc.record<Nothing>({
  type: fc.constant('Nothing'),
})

const optionArbitrary = <A>(
  arb: fc.Arbitrary<A>
): fc.Arbitrary<Option<A>> =>
  fc.oneof(justArbitrary(arb), nothingArbitrary)

const optionStringArbitrary = optionArbitrary(fc.string())

const isCommutative = <A>(
  semigroup: Semigroup<A>,
  one: A,
  two: A
): boolean =>
  eq(semigroup.append(one, two), semigroup.append(two, one))

const isIdempotent = <A>(semigroup: Semigroup<A>, a: A): boolean =>
  eq(semigroup.append(a, a), a)

describe.skip('Option<string> monoid', () => {
  it('Combines two Option<string>', () => {
    expect(
      monoidOptionString.append(just('up'), just('dog'))
    ).toEqual(just('updog'))
    expect(monoidOptionString.append(nothing(), just('hi'))).toEqual(
      just('hi')
    )
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        optionStringArbitrary,
        optionStringArbitrary,
        optionStringArbitrary,
        (a, b, c) => {
          expect(
            isAssociative(monoidOptionString, a, b, c)
          ).toBeTruthy()
        }
      )
    )
  })
  it('Has a working identity value', () => {
    fc.assert(
      fc.property(optionStringArbitrary, (a) => {
        expect(hasIdentity(monoidOptionString, a)).toBeTruthy()
      })
    )
  })
  it('Is not commutative', () => {
    expect(() =>
      fc.assert(
        fc.property(
          optionStringArbitrary,
          optionStringArbitrary,
          (a, b) => {
            expect(
              isCommutative(monoidOptionString, a, b)
            ).toBeTruthy()
          }
        )
      )
    ).toThrow()
  })
  it('Is not idempotent', () => {
    expect(() =>
      fc.assert(
        fc.property(optionStringArbitrary, (a) =>
          expect(isIdempotent(monoidOptionString, a)).toBeTruthy()
        )
      )
    ).toThrow()
  })
})

const optionNumberArbitrary = optionArbitrary(fc.integer())

describe.skip('Option Sum monoid', () => {
  it('Combines two Option Sum', () => {
    expect(monoidOptionSum.append(just(10), just(15))).toEqual(
      just(25)
    )
    expect(monoidOptionSum.append(nothing(), just(10))).toEqual(
      just(10)
    )
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        optionNumberArbitrary,
        optionNumberArbitrary,
        optionNumberArbitrary,
        (a, b, c) => {
          expect(isAssociative(monoidOptionSum, a, b, c)).toBeTruthy()
        }
      )
    )
  })
  it('Has a working identity value', () => {
    fc.assert(
      fc.property(optionNumberArbitrary, (a) => {
        expect(hasIdentity(monoidOptionSum, a)).toBeTruthy()
      })
    )
  })
  it('Is commutative', () => {
    fc.assert(
      fc.property(
        optionNumberArbitrary,
        optionNumberArbitrary,
        (a, b) => {
          expect(isCommutative(monoidOptionSum, a, b)).toBeTruthy()
        }
      )
    )
  })
  it('Is not idempotent', () => {
    expect(() =>
      fc.assert(
        fc.property(optionNumberArbitrary, (a) =>
          expect(isIdempotent(monoidOptionSum, a)).toBeTruthy()
        )
      )
    ).toThrow()
  })
})

const optionAnythingArbitrary = optionArbitrary(fc.anything())

describe.skip('Option First monoid', () => {
  it('Combines two Option First', () => {
    expect(monoidFirst().append(just(10), just(15))).toEqual(just(10))
    expect(monoidFirst().append(nothing(), just(10))).toEqual(
      just(10)
    )
  })
  it('Obeys associativity', () => {
    fc.assert(
      fc.property(
        optionAnythingArbitrary,
        optionAnythingArbitrary,
        optionAnythingArbitrary,
        (a, b, c) => {
          expect(isAssociative(monoidFirst(), a, b, c)).toBeTruthy()
        }
      )
    )
  })
  it('Has a working identity value', () => {
    fc.assert(
      fc.property(optionAnythingArbitrary, (a) => {
        expect(hasIdentity(monoidFirst(), a)).toBeTruthy()
      })
    )
  })
  it('Is not commutative', () => {
    expect(() =>
      fc.assert(
        fc.property(
          optionAnythingArbitrary,
          optionAnythingArbitrary,
          (a, b) => {
            expect(isCommutative(monoidFirst(), a, b)).toBeTruthy()
          }
        )
      )
    ).toThrow()
  })
  it('Is idempotent', () => {
    fc.assert(
      fc.property(optionAnythingArbitrary, (a) =>
        expect(isIdempotent(monoidFirst(), a)).toBeTruthy()
      )
    )
  })
})
