import * as RE from 'fp-ts/ReaderEither'
import { pipe } from 'fp-ts/function'

// let's say we have some classic effectful functions that are hard to test...
// returns an integer between 1 and 6
// or sometimes `null` because life
const getDiceRoll = (): number | null => {
  const succeeded = Math.random() > 0.1
  return succeeded ? Math.floor(Math.random() * 6) : null
}

// logs a string, returns nothing
const log = (str: string): void => {
  console.log(str)
}

// error thrown when the user passes an unusable number of dice
const invalidNumberOfDice = (num: number) => ({
  type: 'InvalidNumberOfDice' as const,
  num,
})

// error thrown sometimes because dice, oh, dice.
const diceExploded = () => ({ type: 'DiceExploded' as const })

// we are going to use the ReaderEither module.
// The `Reader` part lets us pass in a bunch of configuration,
// which is automatically propagated around any function that returns a
// `Reader`
// The `Either` part means the function can return either a success or failure
// value, and most importantly, we have types for each

// let's define the types we are going to use...

// all the actions our function uses
type Actions = {
  getDiceRollAction: typeof getDiceRoll
  logAction: typeof log
}

// the two kinds of errors that can happen
type Errors =
  | ReturnType<typeof invalidNumberOfDice>
  | ReturnType<typeof diceExploded>

// here is our first ReaderEither action:
// it returns either a `diceExploded` error
// or a number between 1-6 (the dice roll)
// all of the actions come from the Reader context, via the `ask` function
const readerRollDice = pipe(
  RE.ask<Actions, never>(),
  RE.chain(({ logAction, getDiceRollAction }) => {
    const value = getDiceRollAction()
    if (value !== null) {
      logAction(`We have rolled ${value}!`)
      return RE.right(value)
    }
    logAction('There was an error!')
    return RE.left(diceExploded())
  })
)

// this is the function that we want to test
// it is also a ReaderEither action, and uses the `readerRollDice` action
// notice how we don't need to thread the Action functions into the
// `readerRollDice` function - all the pipework is done by the `RE` helper
// functions

// given a number, it returns an array of dice rolls or an error
export const ourNeatReaderFunction = (
  numberOfDice: number
): RE.ReaderEither<Actions, Errors, readonly number[]> =>
  numberOfDice < 1 || numberOfDice > 10 // first check we've asked for a reasonable number of dice
    ? RE.left(invalidNumberOfDice(numberOfDice)) // if not, return an 'error'
    : pipe(
        Array(numberOfDice).fill(0),
        RE.traverseArray(() => readerRollDice) // fill each empty with a number using `readerRollDice`
      )
