import * as t from 'io-ts'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/function'

// creating a custom datatype in io-ts

// its for validating a string representing some time in the format
// hh:mm , ie 10:30 or 23:31
type TimeFromString = {
  type: 'TimeFromString'
  hour: number
  mins: number
}

export const TimeFromString = new t.Type<
  TimeFromString,
  string,
  unknown
>(
  // name of this validator
  'TimeFromString',
  // how to tell if u is or is not a TimeFromString
  (u: unknown): u is TimeFromString => {
    const validator = t.type({
      type: t.literal('TimeFromString'),
      hour: t.number,
      mins: t.number,
    })

    const decoded = validator.decode(u)
    if (E.isLeft(decoded)) {
      return false
    }
    return (
      decoded.right.hour > -1 &&
      decoded.right.hour < 24 &&
      decoded.right.mins > -1 &&
      decoded.right.mins < 60
    )
  },
  // how to decode u and turn it into Either<Errors, TimeFromString>
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      E.chain(
        (dateString: string): t.Validation<TimeFromString> => {
          try {
            const hour = parseInt(dateString.substring(0, 2), 10)
            const mins = parseInt(dateString.substring(3, 5), 10)
            return hour && mins
              ? t.success({ type: 'TimeFromString', hour, mins })
              : t.failure(
                  dateString,
                  c,
                  'Time must be of format hh:mm'
                )
          } catch {
            return t.failure(
              dateString,
              c,
              'Time must be of format hh:mm'
            )
          }
        }
      ),
      E.chain((tfs: TimeFromString) => {
        if (tfs.mins < 0) {
          return t.failure(tfs, c, 'Mins must be 0 or above')
        }
        if (tfs.mins > 59) {
          return t.failure(tfs, c, 'Mins must be under 60')
        }
        if (tfs.hour < 0) {
          return t.failure(tfs, c, 'Hour must be 0 or above')
        }
        if (tfs.hour > 23) {
          return t.failure(tfs, c, 'Hour must be under 24')
        }
        return t.success(tfs)
      })
    ),
  // how to turn TimeFromString back into a string
  (tfs: TimeFromString) => {
    const formatNum = (a: number) =>
      a.toLocaleString('en-GB', {
        minimumIntegerDigits: 2,
        useGrouping: false,
      })
    return `${formatNum(tfs.hour)}:${formatNum(tfs.mins)}`
  }
)

console.log('should succeed', TimeFromString.decode('10:30'))

console.log('should fail', TimeFromString.decode('dog'))

console.log('should succeed', TimeFromString.decode('23:01'))

console.log('should fail', TimeFromString.decode('25:01'))
