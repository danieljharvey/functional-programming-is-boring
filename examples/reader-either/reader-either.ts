import * as RE from 'fp-ts/ReaderEither'
import { pipe } from 'fp-ts/function'
// let's say we have some classic effectful functions that are hard to test

// returns an integer between 1 and 6
const getDiceRoll = (_index: number) => {
  return Math.floor(Math.random() * 6)
}

// logs a string, returns nothing
const log = (str: string): void => {
  console.log(str)
}

type Actions = {
  getDiceRollAction: typeof getDiceRoll
  logAction: typeof log
}

type Errors = ReturnType<typeof invalidNumberOfDice>

const invalidNumberOfDice = (num: number) => ({
  type: 'InvalidNumberOfDice' as const,
  num,
})

const diceExploded = () => ({ type: 'DiceExploded' as const })

// this rolls the dice and logs the result
// all of the actions come from the Reader context
const readerRollDice = (index: number) =>
  pipe(
    RE.ask<Actions, never>(),
    RE.map(({ logAction, getDiceRollAction }) => {
      const value = getDiceRollAction(index)
      logAction(`${index}: We have rolled ${value}!`)
      return value
    })
  )

export const ourNeatReaderFunction = (
  numberOfDice: number
): RE.ReaderEither<Actions, Errors, readonly number[]> =>
  numberOfDice < 1 || numberOfDice > 10 // first check we've asked for a reasonable number of dice
    ? RE.left(invalidNumberOfDice(numberOfDice)) // if not, return an 'error'
    : pipe(
        Array(numberOfDice)
          .fill(0)
          .map((_, i) => i), // make an array of empties
        RE.traverseArray(readerRollDice) // fill each empty with a number using `readerRollDice`
      )
