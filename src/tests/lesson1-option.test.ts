import {
  some,
  none,
  map,
  bind,
  orElse,
  newGetHorse,
  newMandatoryTailCheck,
  newHorseFinder,
  standardHorses,
} from '../lesson1-option'

describe('Option', () => {
  it.skip('Some', () => {
    expect(some(1)).toEqual({ type: 'Some', value: 1 })
  })
  it.skip('None', () => {
    expect(none()).toEqual({ type: 'None' })
  })
  it.skip('Map', () => {
    expect(map((a: number) => a + 1, none())).toEqual(none())
    expect(map((a: number) => a + 1, some(1))).toEqual(some(2))
  })
  it.skip('Bind', () => {
    expect(bind((a: number) => some(a + 1), none())).toEqual(
      none()
    )
    expect(bind((a: number) => some(a + 1), some(1))).toEqual(some(2))
    expect(bind((_: number) => none(), some(1))).toEqual(none())
  })
  it.skip('orElse', () => {
    expect(orElse((a: number) => a + 1, 0, some(1))).toEqual(2)
    expect(orElse((a: number) => a + 1, 0, none())).toEqual(0)
  })
  it.skip('newGetHorse', () => {
    expect(newGetHorse('CHAMPION')).toEqual(some(standardHorses[0]))
    expect(newGetHorse('CHOMPION')).toEqual(none())
  })
  it.skip('newMandatoryTailCheck', () => {
    const passHorse = standardHorses[1]
    expect(newMandatoryTailCheck(passHorse).type).toEqual('Some')
    const failHorse = standardHorses[0]
    expect(newMandatoryTailCheck(failHorse)).toEqual(none())
  })
  it.skip('newHorseFinder', () => {
    expect(newHorseFinder('HOOVES_GALORE')).toEqual(
      'Found a good horse named hooves_galore'
    )
    expect(newHorseFinder('CHOMPION')).toEqual(
      'CHOMPION is not a good horse'
    )
  })
})
