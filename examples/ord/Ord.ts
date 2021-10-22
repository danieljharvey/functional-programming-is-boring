import * as BJS from 'fp-ts/BoundedJoinSemilattice'
import * as Ord from 'fp-ts/Ord'
import { Ord as numOrd } from 'fp-ts/number'

const mk = <A>(a: A) => a

export const red = mk<TrafficLight>('red')
export const yellow = mk<TrafficLight>('yellow')
export const yellowFlashing = mk<TrafficLight>('yellow-flashing')
export const green = mk<TrafficLight>('green')

export type TrafficLight =
  | 'red'
  | 'yellow'
  | 'yellow-flashing'
  | 'green'

const tlNums: Record<TrafficLight, number> = {
  red: 0,
  yellow: 1,
  'yellow-flashing': 2,
  green: 3,
}

const trafficLightOrd: Ord.Ord<TrafficLight> = {
  equals: (a, b) => numOrd.equals(tlNums[a], tlNums[b]),
  compare: (a, b) => numOrd.compare(tlNums[a], tlNums[b]),
}

export const trafficLightJoin: BJS.BoundedJoinSemilattice<TrafficLight> = {
  join: Ord.max(trafficLightOrd),
  zero: 'red',
}
