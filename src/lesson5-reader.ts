export type Reader<R, A> = { type: "Reader"; runReader: (r: R) => A };

// most basic constructor
export const reader = <R, A>(runReader: (r: R) => A): Reader<R, A> => ({
  type: "Reader",
  runReader: runReader
});

// take A and plop it into the Reader context
// A -> Reader R A
export const pure = <R, A>(a: A): Reader<R, A> => reader(_ => a);

// run the computation, by passing it the environment
export const runReader = <R, A>(environment: R, value: Reader<R, A>): A =>
  value.runReader(environment);

// the environment we are going to use
type HorseInformation = {
  expectedLegs: number;
  expectedTail: boolean;
  acceptableNames: string[];
};

export const horseInformation: HorseInformation = {
  expectedLegs: 4,
  expectedTail: true,
  acceptableNames: ["CHAMPION", "HOOVES GALORE", "HAM GAMALAN"]
};

// Simplest Reader example (ignores the environment)
export const read1 = pure("Horses");

// Let's add mapping
// map :: (A -> B) -> Reader R A -> Reader R B
export const map = <R, A, B>(
  fn: (a: A) => B,
  readA: Reader<R, A>
): Reader<R, B> => reader(r => fn(readA.runReader(r)));

export const read2 = map(a => a.toUpperCase(), pure("Horses"));

// bind :: (A -> Reader R B) -> Reader R A -> Reader R B
export const bind = <R, A, B>(
  fn: (a: A) => Reader<R, B>,
  readA: Reader<R, A>
): Reader<R, B> => reader(r => fn(readA.runReader(r)).runReader(r));

// let's quickly crack open an Maybe
type Maybe<A> = { type: "Nothing" } | { type: "Just"; value: A };

// just :: A -> Maybe A
const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

// nothing :: Maybe never
const nothing = (): Maybe<never> => ({ type: "Nothing" });

// and a Horse type
type Horse = { type: "Horse"; name: string; legs: number; tail: boolean };

// and a stable they live in
type Stable = { type: "Stable"; horses: Horse[] };

const makeStableWithHorse = (horse: Horse): Stable => ({
  type: "Stable",
  horses: [horse]
});

const horseNameExists = (
  horseName: string
): Reader<HorseInformation, Maybe<Stable>> =>
  reader(horseInfo =>
    horseInfo.acceptableNames.indexOf(horseName) !== -1
      ? just(
          makeStableWithHorse({
            type: "Horse",
            name: horseName,
            legs: horseInfo.expectedLegs,
            tail: horseInfo.expectedTail
          })
        )
      : nothing()
  );

export const read3 = bind(horseNameExists, pure("George"));

const showHorseAcceptability = (value: Maybe<Stable>): string =>
  value.type === "Nothing"
    ? "No good horses here I am afraid"
    : value.value.horses
        .map(horse => `${horse.name} is an acceptable horse`)
        .join(", ");

export const read4 = map(
  showHorseAcceptability,
  bind(horseNameExists, pure("HOOVES GALORE"))
);

// part 2

// These Reader values are a bit unwieldy, so let's make them easier
// to throw around

// ap :: Reader R (A -> B) -> Reader R A -> Reader R B
export const ap = <R, A, B>(
  readF: Reader<R, (a: A) => B>,
  readA: Reader<R, A>
): Reader<R, B> =>
  reader(r => {
    const f = readF.runReader(r);
    const a = readA.runReader(r);
    return f(a);
  });

// curry2 :: (A, B -> C) -> A -> B -> C
const curry2 = <A, B, C>(f: (a: A, b: B) => C) => (a: A) => (b: B) => f(a, b);

// liftA2 :: (A -> B -> C) -> Reader R A -> Reader R B -> Reader R C
export const liftA2 = <R, A, B, C>(
  f: (a: A, b: B) => C,
  readA: Reader<R, A>,
  readB: Reader<R, B>
): Reader<R, C> => ap(map(curry2(f), readA), readB);

type Monoid<A> = {
  empty: A;
  append: (one: A, two: A) => A;
};

// smash together a list of monoid values
// Monoid A -> A[] -> A
const concat = <A>(monoid: Monoid<A>, values: A[]): A =>
  values.reduce(monoid.append, monoid.empty);

// readerMonoid :: Monoid<Reader<R,A>>
const readerMonoid = <R, A>(monoid: Monoid<A>): Monoid<Reader<R, A>> => ({
  empty: pure(monoid.empty),
  append: (readA, readB) => liftA2(monoid.append, readA, readB)
});

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
const strongAndStableMonoid = (): Monoid<Stable> => ({
  empty: { type: "Stable", horses: [] },
  append: (one, two) => ({
    type: "Stable",
    horses: [...one.horses, ...two.horses]
  })
});

// take a list of names
// and work out if they are valid horses or not

// bigHorseValidator :: String[] -> Reader HorseInformation (Maybe Stable)
const bigHorseValidator = (
  names: string[]
): Reader<HorseInformation, Maybe<Stable>> => {
  const monoid = readerMonoid<HorseInformation, Maybe<Stable>>(
    maybeMonoid(strongAndStableMonoid())
  );

  const readerHorses = names.map(horseNameExists);
  return concat(monoid, readerHorses);
};

// acceptableHorsesCheck :: String[] -> Reader HorseInformation String
export const acceptableHorsesCheck = (
  names: string[]
): Reader<HorseInformation, string> =>
  map(showHorseAcceptability, bigHorseValidator(names));
