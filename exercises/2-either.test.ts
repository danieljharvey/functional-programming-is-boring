import * as Exercises from './2-either'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'

describe.skip('2) Either exercises', () => {
  it('one', () => {
    expect(Exercises.one(E.left(Error('oh no')))).toEqual(null)
    expect(Exercises.one(E.right(1))).toEqual(1)
  })
  it('two', () => {
    expect(Exercises.two(Number, E.left(Error('oh no')))).toEqual(
      E.left(Error('oh no'))
    )
    expect(Exercises.two(Number, E.right('1'))).toEqual(E.right(1))
  })
  it('three', () => {
    expect(Exercises.three(E.right('horse'))).toEqual(
      E.right('horse')
    )
    expect(Exercises.three(E.left(100))).toEqual(E.left(200))
  })
  it('four', () => {
    expect(Exercises.four(E.left(Error('oh no')))).toEqual({
      statusCode: 500,
      body: 'oh no',
    })
    expect(
      Exercises.four(E.right('tremendous news everybody'))
    ).toEqual({ statusCode: 200, body: 'tremendous news everybody' })
  })
  it('five', () => {
    expect(Exercises.five(() => 1)).toEqual(E.right(1))
    expect(
      Exercises.five(() => {
        throw Error('oh no')
      })
    ).toEqual(E.left('oh no'))
  })
  it('six', () => {
    expect(Exercises.six(O.none, 'oh no')).toEqual(E.left('oh no'))
    expect(Exercises.six(O.some(1), 'oh no')).toEqual(E.right(1))
  })
  it('seven', () => {
    expect(Exercises.seven([])).toEqual([[], []])
    expect(
      Exercises.seven([E.left(1), E.right('2'), E.left(3)])
    ).toEqual([[1, 3], ['2']])
  })
})
