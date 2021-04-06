import * as Mon from './monoid'
import * as O from 'fp-ts/Option'

describe('Monoid exercises', () => {
  it('one', () => {
    expect(Mon.one([1, 2, 3, 4, 5])).toEqual(15)
    expect(Mon.one([])).toEqual(0)
  })
  it('two', () => {
    expect(Mon.two([1, 2, 3, 4, 5])).toEqual(120)
    expect(Mon.two([])).toEqual(1)
  })
  it('three', () => {
    expect(Mon.three(['log', 'dog', 'frog'])).toEqual('logdogfrog')
    expect(Mon.three([])).toEqual('')
  })
  it('four', () => {
    expect(Mon.four([true, false])).toEqual(true)
    expect(Mon.four([false, false])).toEqual(false)
    expect(Mon.four([])).toEqual(false)
  })
  it('five', () => {
    expect(Mon.five([true, false])).toEqual(false)
    expect(Mon.five([false, false])).toEqual(false)
    expect(Mon.five([true, true])).toEqual(true)
    expect(Mon.five([])).toEqual(true)
  })
  it('six', () => {
    expect(
      Mon.six([
        { x: 1, y: 1 },
        { x: -1, y: -1 },
      ])
    ).toEqual({ x: 0, y: 0 })
    expect(
      Mon.six([
        { x: 1, y: 1 },
        { x: -1, y: -1 },
      ])
    ).toEqual({ x: 0, y: 0 })

    expect(Mon.six([])).toEqual({ x: 0, y: 0 })
  })
  it('seven', () => {
    expect(Mon.seven([100, 120, 140])).toEqual(140)
    expect(Mon.seven([])).toEqual(-Infinity)
  })
  it('eight', () => {
    expect(Mon.eight([100, 120, 140])).toEqual(100)
    expect(Mon.eight([])).toEqual(Infinity)
  })
  it('nine', () => {
    expect(Mon.nine([100, 120, 140])).toEqual([100, 140])
    expect(Mon.nine([150, 120, 140])).toEqual([120, 150])
    expect(Mon.nine([])).toEqual([Infinity, -Infinity])
  })
  it('ten', () => {
    expect(Mon.ten([O.none])).toEqual(O.none)
    expect(Mon.ten([O.none, O.some(1), O.some(2)])).toEqual(O.some(1))
    expect(Mon.ten([])).toEqual(O.none)
  })
  it('eleven', () => {
    expect(Mon.eleven([O.none])).toEqual(O.none)
    expect(Mon.eleven([O.some({ name: 'dog', age: 1 })])).toEqual(
      O.some({ name: 'dog', age: 1 })
    )
    expect(
      Mon.eleven([
        O.some({ name: 'dog', age: 1 }),
        O.some({ name: 'log', age: 10 }),
      ])
    ).toEqual(O.some({ name: 'log', age: 11 }))

    expect(Mon.eleven([])).toEqual(O.none)
  })
  it('twelve', () => {
    const a = Mon.twelve([a => a > 5, a => a < 10])
    expect(a(6)).toEqual(true)
    const b = Mon.twelve([a => a > 5, a => a < 10])
    expect(b(12)).toEqual(false)
    const c = Mon.twelve([])
    expect(c(6)).toEqual(true)
  })
})
