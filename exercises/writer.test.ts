import * as W from 'fp-ts/Writer'
import * as Wri from './writer'

describe('writer', () => {
  it('one', () => {
    expect(Wri.one(1)()).toEqual([1, []])
  })
  it('two', () => {
    expect(Wri.two(Wri.logWriterM.of(10))()).toEqual([20, []])
    expect(Wri.two(() => [10, ['horse']])()).toEqual([20, ['horse']])
  })
  it('three', () => {
    expect(Wri.three(Wri.logWriterM.of(10))).toEqual(10)
    expect(Wri.three(() => [10, ['horse']])).toEqual(10)
  })
  it('four', () => {
    expect(Wri.four(Wri.logWriterM.of(10))).toEqual([])
    expect(Wri.four(() => [10, ['horse']])).toEqual(['horse'])
  })
  it('five', () => {
    expect(Wri.five('horse')(() => [10, ['mr']])()).toEqual([
      10,
      ['mr', 'horse'],
    ])
    expect(Wri.five('horse')(() => [10, []])()).toEqual([
      10,
      ['horse'],
    ])
  })
  it('six', () => {
    const wA: W.Writer<string[], number> = () => [10, ['dog']]

    const wB: W.Writer<string[], number> = () => [20, ['log']]

    expect(Wri.six(a => b => a - b, wA, wB)()).toEqual([
      -10,
      ['dog', 'log'],
    ])
  })
})
