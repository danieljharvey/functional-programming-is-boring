import * as ST from 'fp-ts/Store'

import * as NE from 'fp-ts/NonEmptyArray'

// this is our raw data, about horse race times
type Race = {
  horseName: string
  finishTime: number
}

// this is how we store the data
// there must be at least one item, hence we use a datatype
// that ensures this
const resultData = NE.cons(
  { horseName: 'Dutch Uncle', finishTime: 2.59 },
  [
    { horseName: 'Entire dog', finishTime: 10.0 },
    { horseName: 'Pizza', finishTime: 90.1 },
    { horseName: 'The Internet', finishTime: 15.79 },
    { horseName: 'Infinite Jeff', finishTime: 18.1 },
    { horseName: 'Please, no', finishTime: 13.21 },
    { horseName: 'Slop', finishTime: 18.1 },
  ]
)

// create our Store comonad
// it doesn't store the data itself, but instead just knows the current
// position we are looking at, and how to fetch
const results: ST.Store<number, Race> = {
  peek: (index: number) => {
    // when going less than 0, grab the end result instead
    const realIndex = (index + resultData.length) % resultData.length
    return resultData[realIndex]
  },
  pos: 1,
}

const next = ST.seeks<number>((a) => a + 1)

const prev = ST.seeks<number>((a) => a - 1)

console.log('first result', ST.extract(results))
//console.log('second result', ST.extract(next(results)))
//console.log('first result again', ST.extract(next(prev(results))))

// because Store is a Comonad, and all Comonads are also Functors,
// we are able to map over all the items inside if we want
const loudResults = ST.map((result: Race) => ({
  ...result,
  horseName: result.horseName.toUpperCase(),
}))(results)

//console.log('First result with big name', ST.extract(loudResults))
const getAverage = (arr: number[]) =>
  arr.reduce((p, c) => p + c, 0) / arr.length

type Average = {
  average: number
}

// more excitingly, we are able to use `extend` to do context-aware
// computations, where each item can peek at the items around it
// this can be used in graphics to creating blur functions
// or to simulate the classic Comonad example, Conways Game of Life
const rollingAverages = ST.extend<number, Race, Average>((res) => {
  const prevValue = ST.extract(prev(res))
  const thisValue = ST.extract(res)
  const nextValue = ST.extract(next(res))

  return {
    average: getAverage([
      prevValue.finishTime,
      thisValue.finishTime,
      nextValue.finishTime,
    ]),
  }
})(results)

// we can use this new store to grab individual averages
//console.log('first rolling average', ST.extract(rollingAverages))
/*
console.log(
  'second rolling average',
  ST.extract(next(rollingAverages))
)
console.log(
  'third rolling average',
  ST.extract(next(next(rollingAverages)))
)*/

// or grab all the keys and get them all
const keys = [...resultData.keys()]

const averages = keys
  .map((a) => rollingAverages.peek(a))
  .map((a) => a.average)
//console.log('Rolling average finish time', averages)
