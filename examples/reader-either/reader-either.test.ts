import { ourNeatReaderFunction } from './reader-either'
import * as E from 'fp-ts/Either'

const stubbedActions = {
  getDiceRollAction: () => 1,
  logAction: () => {},
}

describe('Our neat reader function', () => {
  it('fails when less than 1 dice requested', () => {
    const result = ourNeatReaderFunction(0)(stubbedActions)
    expect(E.isLeft(result)).toEqual(true)
  })
  it('always returns 1', () => {
    const result = ourNeatReaderFunction(5)(stubbedActions)
    expect(result).toEqual(E.right([1, 1, 1, 1, 1]))
  })
  it('returns an ascending sequence', () => {
    const newStubbedActions = {
      getDiceRollAction: (i: number) => i + 1,
      logAction: () => {},
    }
    const result = ourNeatReaderFunction(5)(newStubbedActions)
    expect(result).toEqual(E.right([1, 2, 3, 4, 5]))
  })
})
