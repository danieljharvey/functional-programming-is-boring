import * as O from 'fp-ts/Option'
import {
  safeListGet,
  things,
  getManyThings,
  listGetLoud,
} from './Option'

describe('Option examples', () => {
  describe('safeListGet', () => {
    it('finds an item that exists', () => {
      expect(safeListGet(0, things)).toEqual(O.some('dog'))
    })
    it('return None for an item that doesn`t exist', () => {
      expect(safeListGet(7, things)).toEqual(O.none) // None
    })
  })

  describe('getManyThings', () => {
    it('finds everything and wraps it in Some', () => {
      expect(getManyThings([3, 2, 1, 0], things)).toEqual(
        O.some(['pog', 'hog', 'log', 'dog'])
      )
    })
    it('does not find everything and returns None', () => {
      expect(getManyThings([3, 2, 1, 0, -1], things)).toEqual(O.none)
    })
  })

  describe('listGetLoud', () => {
    it('finds an item and makes it loud', () => {
      expect(listGetLoud(0)).toEqual(O.some('DOG!!!'))
    })
    it('does not find an item or make it loud', () => {
      expect(listGetLoud(-1)).toEqual(O.none)
    })
  })
})
