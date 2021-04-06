import * as W from 'fp-ts/Writer'
import * as Wri from './writer'

describe('writer', () => {
  it('one', () => {
    expect(Wri.one(1)()).toEqual([1, []])
  })
  it('two', () => {
    expect(Wri.two(Wri.logWriter.of(10))()).toEqual([20, []])
    expect(Wri.two(() => [10, ['horse']])()).toEqual([20, ['horse']])
  })
  it('three', () => {
    expect(Wri.three(Wri.logWriter.of(10))).toEqual(10)
    expect(Wri.three(() => [10, ['horse']])).toEqual(10)
  })
})
