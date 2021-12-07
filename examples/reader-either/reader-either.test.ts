import { ourNeatReaderFunction } from './reader-either'
import * as E from 'fp-ts/Either'

// the most interesting part is how we can now test these functions
// by providing all the 'interesting' functionality via the Reader
// we provide all the useful functions when running it, and can replace them
// with different ones for testing in a very clear fashion
describe('Our neat reader function', () => {
  it('fails when less than 1 dice requested', () => {
    const stubbedActions = {
      getDiceRollAction: () => 1,
      logAction: () => {},
    }
    const result = ourNeatReaderFunction(0)(stubbedActions)
    expect(E.isLeft(result)).toEqual(true)
  })

  it('always returns 1', () => {
    const stubbedActions = {
      getDiceRollAction: () => 1,
      logAction: () => {},
    }
    const result = ourNeatReaderFunction(5)(stubbedActions)
    expect(result).toEqual(E.right([1, 1, 1, 1, 1]))
  })

  it('returns an ascending sequence', () => {
    // we store the count in a closure so we can return a higher value each
    // time
    const incrementingDiceRoll = () => {
      let count = 0
      return () => {
        count = count + 1
        return count
      }
    }
    const stubbedActions = {
      getDiceRollAction: incrementingDiceRoll(),
      logAction: () => {},
    }
    const result = ourNeatReaderFunction(5)(stubbedActions)
    expect(result).toEqual(E.right([1, 2, 3, 4, 5]))
  })

  it('errors if a dice explodes', () => {
    const stubbedActions = {
      getDiceRollAction: () => null,
      logAction: () => {},
    }
    const result = ourNeatReaderFunction(5)(stubbedActions)
    expect(result).toEqual(E.left({ type: 'DiceExploded' }))
  })
})
