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

  describe('Tree', () => {
    it('works', () => {
      // regular map
      expect(
        Fun.treeMap(
          Fun.double,
          Fun.branch(
            Fun.leaf,
            1 as number,
            Fun.branch(Fun.leaf, 2, Fun.leaf)
          )
        )
      ).toEqual(
        Fun.branch(
          Fun.leaf,
          2 as number,
          Fun.branch(Fun.leaf, 4, Fun.leaf)
        )
      )

      expect(Fun.treeMap(Fun.double, Fun.leaf)).toEqual(Fun.leaf)
    })
    it('satisfies identity', () => {
      // identity
      expect(
        Fun.treeMap(Fun.id, Fun.branch(Fun.leaf, 1, Fun.leaf))
      ).toEqual(Fun.branch(Fun.leaf, 1, Fun.leaf))
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        Fun.treeMap(
          Fun.numToString,
          Fun.treeMap(Fun.double, Fun.branch(Fun.leaf, 1, Fun.leaf))
        )
      ).toEqual(
        Fun.treeMap(
          compose(Fun.numToString, Fun.double),
          Fun.branch(Fun.leaf, 1, Fun.leaf)
        )
      )
    })
  })

  const runReader = <R, A>(reader: Fun.Reader<R, A>, value: R): A =>
    reader.runReader(value)

  describe('Reader', () => {
    it('works', () => {
      // regular map
      expect(
        runReader(
          Fun.readerMap(
            Fun.double,
            Fun.reader(_r => 1)
          ),
          'test'
        )
      ).toEqual(2)
      expect(
        runReader(
          Fun.readerMap(
            Fun.double,
            Fun.reader((r: number) => r + 1)
          ),
          10
        )
      ).toEqual(22)
    })
    it('satisfies identity', () => {
      expect(
        runReader(
          Fun.readerMap(
            Fun.id,
            Fun.reader(_r => 1)
          ),
          'test'
        )
      ).toEqual(1)

      expect(
        runReader(
          Fun.readerMap(
            Fun.id,
            Fun.reader((r: number) => r + 1)
          ),
          10
        )
      ).toEqual(11)
    })
    it('satisifies commutativeness (?)', () => {
      expect(
        runReader(
          Fun.readerMap(
            Fun.numToString,
            Fun.readerMap(
              Fun.double,
              Fun.reader((r: number) => r + 1)
            )
          ),
          10
        )
      ).toEqual(
        runReader(
          Fun.readerMap(
            compose(Fun.numToString, Fun.double),
            Fun.reader((r: number) => r + 1)
          ),
          10
        )
      )
    })
  })

  const taskToPromise = <A>(value: Fun.Task<A>): Promise<A> =>
    new Promise(resolve => {
      value.runTask(resolve)
    })

  describe('Task', () => {
    it('works', async () => {
      // regular map
      expect(
        await taskToPromise(Fun.taskMap(Fun.double, Fun.taskOf(1)))
      ).toEqual(2)
    })
    it('satisfies identity', async () => {
      expect(
        await taskToPromise(Fun.taskMap(Fun.id, Fun.taskOf(1)))
      ).toEqual(1)
    })
    it('satisifies commutativeness (?)', async () => {
      expect(
        await taskToPromise(
          Fun.taskMap(
            Fun.numToString,
            Fun.taskMap(Fun.double, Fun.taskOf(1))
          )
        )
      ).toEqual(
        await taskToPromise(
          Fun.taskMap(
            compose(Fun.numToString, Fun.double),
            Fun.taskOf(1)
          )
        )
      )
    })
  })
})
