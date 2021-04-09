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

  describe('Either', () => {
    it('works', () => {
      // regular map
      expect(Fun.eitherMap(Fun.double, Fun.right(1))).toEqual(
        Fun.right(2)
      )
      expect(Fun.eitherMap(Fun.double, Fun.left('hi'))).toEqual(
        Fun.left('hi')
      )
    })
    it('satisfies identity', () => {
      // identity
      expect(Fun.eitherMap(Fun.id, Fun.right(1))).toEqual(
        Fun.right(1)
      )
      expect(Fun.eitherMap(Fun.id, Fun.left('test'))).toEqual(
        Fun.left('test')
      )
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        Fun.eitherMap(
          Fun.numToString,
          Fun.eitherMap(Fun.double, Fun.right(1))
        )
      ).toEqual(
        Fun.eitherMap(
          compose(Fun.numToString, Fun.double),
          Fun.right(1)
        )
      )
    })
  })

  describe('Pair', () => {
    it('works', () => {
      // regular map
      expect(Fun.pairMap(Fun.double, ['test', 1])).toEqual([
        'test',
        2,
      ])
    })
    it('satisfies identity', () => {
      // identity
      expect(Fun.pairMap(Fun.id, ['test', 1])).toEqual(['test', 1])
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        Fun.pairMap(
          Fun.numToString,
          Fun.pairMap(Fun.double, ['test', 1])
        )
      ).toEqual(
        Fun.pairMap(compose(Fun.numToString, Fun.double), ['test', 1])
      )
    })
  })
})
