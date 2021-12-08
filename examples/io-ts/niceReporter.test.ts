import { niceReporter } from './nice-reporter'
import * as t from 'io-ts'

describe('NiceReporter', () => {
  it('Basic failures', () => {
    const result = t.number.decode('dog')
    expect(niceReporter(result)).toEqual(['Expected number, got dog'])
  })

  it('Enum failure', () => {
    const trafficLight = t.union([
      t.literal('red'),
      t.literal('yellow'),
      t.literal('green'),
    ])

    const result = trafficLight.decode('dog')
    expect(niceReporter(result)).toEqual([
      'Expected ("red" | "yellow" | "green"), got dog',
    ])
  })

  it('Enum failure uses name', () => {
    const trafficLight = t.union(
      [t.literal('red'), t.literal('yellow'), t.literal('green')],
      'TrafficLight'
    )

    const result = trafficLight.decode('dog')
    expect(niceReporter(result)).toEqual([
      'Expected TrafficLight, got dog',
    ])
  })

  it('Missing field in type', () => {
    const userRecord = t.type({ name: t.string })

    const result = userRecord.decode({})
    expect(niceReporter(result)).toEqual([
      'name: Expected string, got undefined',
    ])
  })

  it('Multiple missing fields in type', () => {
    const userRecord = t.type({ name: t.string, age: t.number })

    const result = userRecord.decode({})
    expect(niceReporter(result)).toEqual([
      'name: Expected string, got undefined',
      'age: Expected number, got undefined',
    ])
  })

  it('One missing field in type', () => {
    const userRecord = t.type({ name: t.string, age: t.number })

    const result = userRecord.decode({ age: 123 })
    expect(niceReporter(result)).toEqual([
      'name: Expected string, got undefined',
    ])
  })

  it('Error in nested type', () => {
    const userRecord = t.type({
      name: t.string,
      pets: t.type({ dog: t.boolean }),
    })

    const result = userRecord.decode({ name: 'Dog', pets: {} })
    expect(niceReporter(result)).toEqual([
      'pets.dog: Expected boolean, got undefined',
    ])
  })
})
