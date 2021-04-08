import * as Fun from './functors'

const compose = <A, B, C>(f: (b: B) => C, g: (a: A) => B) => (
  a: A
): C => f(g(a))

describe('Functors', () => {
  describe('Identity', () => {
    it('works', () => {
      // regular map
      expect(Fun.identityMap(Fun.double, Fun.identity(1))).toEqual(
        Fun.identity(2)
      )
    })
    it('satisfies identity', () => {
      // identity
      expect(Fun.identityMap(Fun.id, Fun.identity(1))).toEqual(
        Fun.identity(1)
      )
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        Fun.identityMap(
          Fun.numToString,
          Fun.identityMap(Fun.double, Fun.identity(1))
        )
      ).toEqual(
        Fun.identityMap(
          compose(Fun.numToString, Fun.double),
          Fun.identity(1)
        )
      )
    })
  })

  describe('Maybe', () => {
    it('works', () => {
      // regular map
      expect(Fun.maybeMap(Fun.double, Fun.just(1))).toEqual(
        Fun.just(2)
      )
      expect(Fun.maybeMap(Fun.double, Fun.nothing)).toEqual(
        Fun.nothing
      )
    })
    it('satisfies identity', () => {
      // identity
      expect(Fun.maybeMap(Fun.id, Fun.just(1))).toEqual(Fun.just(1))
      expect(Fun.maybeMap(Fun.id, Fun.nothing)).toEqual(Fun.nothing)
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        Fun.maybeMap(
          Fun.numToString,
          Fun.maybeMap(Fun.double, Fun.just(1))
        )
      ).toEqual(
        Fun.maybeMap(
          compose(Fun.numToString, Fun.double),
          Fun.just(1)
        )
      )
    })
  })
})
