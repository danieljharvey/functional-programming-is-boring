import { niceReporter } from './niceReporter'
import * as t from 'io-ts'

describe('NiceReporter', () => {
  it('Basic failures', () => {
    const result = t.number.decode('dog')
    expect(niceReporter(result)).toEqual([
      'Expected number, got string',
    ])
  })

  it('Enum failure', () => {
    const trafficLight = t.union([
      t.literal('red'),
      t.literal('yellow'),
      t.literal('green'),
    ])

    const result = trafficLight.decode('dog')
    expect(niceReporter(result)).toEqual([
      'Expected ("red" | "yellow" | "green"), got string',
    ])
  })

  it('Enum failure uses name', () => {
    const trafficLight = t.union(
      [t.literal('red'), t.literal('yellow'), t.literal('green')],
      'TrafficLight'
    )

    const result = trafficLight.decode('dog')
    expect(niceReporter(result)).toEqual([
      'Expected TrafficLight, got string',
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

  it('Multiple items missing in a record', () => {
    const userRecord = t.type({
      name: t.string,
      pets: t.type({ dog: t.boolean }),
    })

    const result = userRecord.decode({})
    expect(niceReporter(result)).toEqual([
      'name: Expected string, got undefined',
      'pets: Expected { dog: boolean }, got undefined',
    ])
  })

  const maybe = (prop: t.Type<any>) =>
    t.union([
      t.type({ type: t.literal('Just'), value: prop }),
      t.type({ type: t.literal('Nothing') }),
    ])

  it('Cannot match union type', () => {
    const userRecord = t.type({
      maybeThing: maybe(t.string),
    })

    const result = userRecord.decode({ maybeThing: 123 })
    expect(niceReporter(result)).toEqual([
      'maybeThing: Expected ({ type: "Just", value: string } | { type: "Nothing" }), got number',
    ])
  })

  it('Partial match on union type', () => {
    const userRecord = t.type({
      maybeThing: maybe(t.string),
    })

    const result = userRecord.decode({
      maybeThing: { type: 'Just', value: 123 },
    })
    expect(niceReporter(result)).toEqual([
      'maybeThing.value: Expected string, got number',
    ])
  })
})
