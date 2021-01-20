import {
  isSome,
  isNone,
  some,
  none,
  join,
  map,
  bind,
  orElse,
  newGetHorse,
  newMandatoryTailCheck,
  newHorseFinder,
  standardHorses,
} from '../lesson1-option'

describe('Option', () => {
  describe.skip('Horse finding', () => {
    it('newGetHorse', () => {
      expect(newGetHorse('CHAMPION')).toEqual(some(standardHorses[0]))
      expect(newGetHorse('CHOMPION')).toEqual(none())
    })
    it('newMandatoryTailCheck', () => {
      const passHorse = standardHorses[1]
      expect(newMandatoryTailCheck(passHorse).type).toEqual('Some')
      const failHorse = standardHorses[0]
      expect(newMandatoryTailCheck(failHorse)).toEqual(none())
    })
    it('newHorseFinder', () => {
      expect(newHorseFinder('HOOVES_GALORE')).toEqual(
        'Found a good horse named hooves_galore'
      )
      expect(newHorseFinder('CHOMPION')).toEqual(
        'CHOMPION is not a good horse'
      )
    })
  })
  describe.skip('Helpers', () => {
    it('Some', () => {
      expect(some(1)).toEqual({ type: 'Some', value: 1 })
    })
    it('None', () => {
      expect(none()).toEqual({ type: 'None' })
    })
    it('isSome', () => {
      expect(isSome(some(1))).toBeTruthy()
      expect(isSome(none())).toBeFalsy()
    })
    it('isNone', () => {
      expect(isNone(some(1))).toBeFalsy()
      expect(isNone(none())).toBeTruthy()
    })
    it('Join', () => {
      expect(join(some(some(1)))).toEqual(some(1))
      expect(join(some(none()))).toEqual(none())
    })
    it('Map', () => {
      expect(map((a: number) => a + 1, none())).toEqual(none())
      expect(map((a: number) => a + 1, some(1))).toEqual(some(2))
    })
    it('Bind', () => {
      expect(bind((a: number) => some(a + 1), none())).toEqual(none())
      expect(bind((a: number) => some(a + 1), some(1))).toEqual(
        some(2)
      )
      expect(bind((_: number) => none(), some(1))).toEqual(none())
    })
    it('orElse', () => {
      expect(orElse((a: number) => a + 1, 0, some(1))).toEqual(2)
      expect(orElse((a: number) => a + 1, 0, none())).toEqual(0)
    })
  })
})
