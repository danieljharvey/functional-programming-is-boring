export type Reader<R, A> = { type: 'Reader'; runReader: (r: R) => A }

// most basic constructor
export const reader = <R, A>(
  runReader: (r: R) => A
): Reader<R, A> => ({
  type: 'Reader',
  runReader: runReader,
})

// run the computation, by passing it the environment
export const runReader = <R, A>(
  environment: R,
  value: Reader<R, A>
): A => value.runReader(environment)

// take A and plop it into the Reader context
// pure :: A -> Reader R A
export const pure = undefined as any

// Let's add mapping
// map :: (A -> B) -> Reader R A -> Reader R B
export const map = undefined as any

// bind :: (A -> Reader R B) -> Reader R A -> Reader R B
export const bind = undefined as any

// ap :: Reader R (A -> B) -> Reader R A -> Reader R B
export const ap = undefined as any

// curry2 :: (A, B -> C) -> A -> B -> C
const curry2 = undefined as any

// liftA2 :: (A -> B -> C) -> Reader R A -> Reader R B -> Reader R C
export const liftA2 = <R, A, B, C>(
  f: (a: A, b: B) => C,
  readA: Reader<R, A>,
  readB: Reader<R, B>
): Reader<R, C> => ap(map(curry2(f), readA), readB)

////////////////////////////
// a horse based exercise //
////////////////////////////

// first, some types

type Horse = {
  type: 'Horse'
  name: string
  legs: number
  tail: boolean
}

type Stable = { type: 'Stable'; horses: Horse[] }

type HorseInformation = {
  expectedLegs: number
  expectedTail: boolean
  acceptableNames: string[]
}

type Logger = (a: string) => void

export type FeatureFlags = {
  convertToUppercase: boolean
}

// let's quickly crack open an Option
type Option<A> = { type: 'None' } | { type: 'Some'; value: A }

// some :: A -> Option A
const some = <A>(value: A): Option<A> => ({ type: 'Some', value })

// none :: Option never
const none = (): Option<never> => ({ type: 'None' })

// remember this old friend?
type Monoid<A> = {
  empty: A
  append: (one: A, two: A) => A
}

// and some helpers
const makeStableWithHorse = (horse: Horse): Stable => ({
  type: 'Stable',
  horses: [horse],
})

// this data is used to validate the horses
export const horseInformation: HorseInformation = {
  expectedLegs: 4,
  expectedTail: true,
  acceptableNames: ['CHAMPION', 'HOOVES GALORE', 'HAM GAMALAN'],
}

// smash together a list of monoid values
// Monoid A -> A[] -> A
const concat = <A>(monoid: Monoid<A>, values: A[]): A =>
  values.reduce(monoid.append, monoid.empty)

// optionMonoid :: Monoid<Option<A>>
const optionMonoid = <A>(monoid: Monoid<A>): Monoid<Option<A>> => ({
  empty: none(),
  append: (one, two) => {
    if (one.type === 'None') {
      return two
    } else if (two.type == 'None') {
      return one
    }
    return some(monoid.append(one.value, two.value))
  },
})

// strongAndStableMonoid :: Monoid<Stable>
const stableMonoid = (): Monoid<Stable> => ({
  empty: { type: 'Stable', horses: [] },
  append: (one, two) => ({
    type: 'Stable',
    horses: [...one.horses, ...two.horses],
  }),
})

// take a list of names
// and work out if they are valid horses or not

////////////////////

const oldHorseNameExists = (
  logger: Logger,
  horseInfo: HorseInformation,
  horseName: string
): Option<Stable> => {
  logger(`Checking for horse name: ${horseName}`)
  return horseInfo.acceptableNames.indexOf(horseName) !== -1
    ? some(
        makeStableWithHorse({
          type: 'Horse',
          name: horseName,
          legs: horseInfo.expectedLegs,
          tail: horseInfo.expectedTail,
        })
      )
    : none()
}

const oldShowHorseAcceptability = (value: Option<Stable>): string =>
  value.type === 'None'
    ? 'No good horses here I am afraid'
    : value.value.horses
        .map((horse) => `${horse.name} is an acceptable horse`)
        .join(', ')

// check feature flag to see if we should convert name to uppercase
// and log what we are doing
const oldHorseNameToUppercase = (
  logger: (a: string) => void,
  featureFlags: FeatureFlags,
  name: string
): string => {
  if (featureFlags.convertToUppercase) {
    logger('Converting to uppercase')
    return name.toUpperCase()
  }
  logger('Not converting to uppercase')
  return name
}

const oldHorseValidator = (
  logger: Logger,
  horseInfo: HorseInformation,
  featureFlags: FeatureFlags,
  names: string[]
): Option<Stable> => {
  const optionStableMonoid = optionMonoid(stableMonoid())

  const optionStables = names.map((name) => {
    const uppercaseName = oldHorseNameToUppercase(
      logger,
      featureFlags,
      name
    )
    return oldHorseNameExists(logger, horseInfo, uppercaseName)
  })
  return concat(optionStableMonoid, optionStables)
}

// given a list of names, return a string describing the validity of said
// horses
export const oldAcceptableHorsesCheck = (
  logger: Logger,
  horseInfo: HorseInformation,
  featureFlags: FeatureFlags,
  names: string[]
): string => {
  const stable = oldHorseValidator(
    logger,
    horseInfo,
    featureFlags,
    names
  )
  return oldShowHorseAcceptability(stable)
}

///////////////////////////

// what if we rewrote them to include all their dependencies in here instead?
export type Environment = {
  horseInfo: HorseInformation
  logger: Logger
  featureFlags: FeatureFlags
}

// horseNameExists :: String -> Reader Environment (Option Stable)

// readerMonoid :: Monoid<Reader<R,A>>

// readerOptionStableMonoid :: Monoid<Reader<Option<Stable>>>

// horseNameToUppercase :: String -> Reader Environment String

// bigHorseValidator :: String[] -> Reader Environment (Option Stable)

// showHorseAcceptability :: Option Stable -> String

// acceptableHorsesCheck :: String[] -> Reader Environment String
export const acceptableHorsesCheck = undefined as any
