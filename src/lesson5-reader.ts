export type Reader<R, A> = { type: "Reader"; runReader: (r: R) => A };

// most basic constructor
export const reader = <R, A>(runReader: (r: R) => A): Reader<R, A> => ({
  type: "Reader",
  runReader: runReader
});

// run the computation, by passing it the environment
export const runReader = <R, A>(environment: R, value: Reader<R, A>): A =>
  value.runReader(environment);

// take A and plop it into the Reader context
// pure :: A -> Reader R A
export const pure = undefined as any;

// Let's add mapping
// map :: (A -> B) -> Reader R A -> Reader R B
export const map = undefined as any;

// bind :: (A -> Reader R B) -> Reader R A -> Reader R B
export const bind = undefined as any;

// ap :: Reader R (A -> B) -> Reader R A -> Reader R B
export const ap = undefined as any;

// curry2 :: (A, B -> C) -> A -> B -> C
const curry2 = undefined as any;

// liftA2 :: (A -> B -> C) -> Reader R A -> Reader R B -> Reader R C
export const liftA2 = <R, A, B, C>(
  f: (a: A, b: B) => C,
  readA: Reader<R, A>,
  readB: Reader<R, B>
): Reader<R, C> => ap(map(curry2(f), readA), readB);

////////////////////////////
// a horse based exercise //
////////////////////////////

// first, some types

type Horse = { type: "Horse"; name: string; legs: number; tail: boolean };

type Stable = { type: "Stable"; horses: Horse[] };

type HorseInformation = {
  expectedLegs: number;
  expectedTail: boolean;
  acceptableNames: string[];
};

type Logger = (a: string) => void;

export type FeatureFlags = {
  convertToUppercase: boolean;
};

// let's quickly crack open an Maybe
type Maybe<A> = { type: "Nothing" } | { type: "Just"; value: A };

// just :: A -> Maybe A
const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

// nothing :: Maybe never
const nothing = (): Maybe<never> => ({ type: "Nothing" });

// remember this old friend?
type Monoid<A> = {
  empty: A;
  append: (one: A, two: A) => A;
};

// and some helpers
const makeStableWithHorse = (horse: Horse): Stable => ({
  type: "Stable",
  horses: [horse]
});

// this data is used to validate the horses
export const horseInformation: HorseInformation = {
  expectedLegs: 4,
  expectedTail: true,
  acceptableNames: ["CHAMPION", "HOOVES GALORE", "HAM GAMALAN"]
};

// smash together a list of monoid values
// Monoid A -> A[] -> A
const concat = <A>(monoid: Monoid<A>, values: A[]): A =>
  values.reduce(monoid.append, monoid.empty);

// maybeMonoid :: Monoid<Maybe<A>>
const maybeMonoid = <A>(monoid: Monoid<A>): Monoid<Maybe<A>> => ({
  empty: nothing(),
  append: (one, two) => {
    if (one.type === "Nothing") {
      return two;
    } else if (two.type == "Nothing") {
      return one;
    }
    return just(monoid.append(one.value, two.value));
  }
});

// strongAndStableMonoid :: Monoid<Stable>
const stableMonoid = (): Monoid<Stable> => ({
  empty: { type: "Stable", horses: [] },
  append: (one, two) => ({
    type: "Stable",
    horses: [...one.horses, ...two.horses]
  })
});

// take a list of names
// and work out if they are valid horses or not

////////////////////

const oldHorseNameExists = (
  logger: Logger,
  horseInfo: HorseInformation,
  horseName: string
): Maybe<Stable> => {
  logger(`Checking for horse name: ${horseName}`);
  return horseInfo.acceptableNames.indexOf(horseName) !== -1
    ? just(
        makeStableWithHorse({
          type: "Horse",
          name: horseName,
          legs: horseInfo.expectedLegs,
          tail: horseInfo.expectedTail
        })
      )
    : nothing();
};

const oldShowHorseAcceptability = (value: Maybe<Stable>): string =>
  value.type === "Nothing"
    ? "No good horses here I am afraid"
    : value.value.horses
        .map(horse => `${horse.name} is an acceptable horse`)
        .join(", ");

// check feature flag to see if we should convert name to uppercase
// and log what we are doing
const oldHorseNameToUppercase = (
  logger: (a: string) => void,
  featureFlags: FeatureFlags,
  name: string
): string => {
  if (featureFlags.convertToUppercase) {
    logger("Converting to uppercase");
    return name.toUpperCase();
  }
  logger("Not converting to uppercase");
  return name;
};

const oldHorseValidator = (
  logger: Logger,
  horseInfo: HorseInformation,
  featureFlags: FeatureFlags,
  names: string[]
): Maybe<Stable> => {
  const maybeStableMonoid = maybeMonoid(stableMonoid());

  const maybeStables = names.map(name => {
    const uppercaseName = oldHorseNameToUppercase(logger, featureFlags, name);
    return oldHorseNameExists(logger, horseInfo, uppercaseName);
  });
  return concat(maybeStableMonoid, maybeStables);
};

// given a list of names, return a string describing the validity of said
// horses
export const oldAcceptableHorsesCheck = (
  logger: Logger,
  horseInfo: HorseInformation,
  featureFlags: FeatureFlags,
  names: string[]
): string => {
  const stable = oldHorseValidator(logger, horseInfo, featureFlags, names);
  return oldShowHorseAcceptability(stable);
};

///////////////////////////

// what if we rewrote them to include all their dependencies in here instead?
export type Environment = {
  horseInfo: HorseInformation;
  logger: Logger;
  featureFlags: FeatureFlags;
};

// horseNameExists :: String -> Reader Environment (Maybe Stable)

// readerMonoid :: Monoid<Reader<R,A>>

// readerMaybeStableMonoid :: Monoid<Reader<Maybe<Stable>>>

// horseNameToUppercase :: String -> Reader Environment String

// bigHorseValidator :: String[] -> Reader Environment (Maybe Stable)

// showHorseAcceptability :: Maybe Stable -> String

// acceptableHorsesCheck :: String[] -> Reader Environment String
export const acceptableHorsesCheck = undefined as any;
