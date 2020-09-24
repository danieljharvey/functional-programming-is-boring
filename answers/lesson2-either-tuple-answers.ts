export type Either<E, A> =
  | { type: "Left"; value: E }
  | { type: "Right"; value: A };

type Horse = { type: "HORSE"; name: string; legs: number; hasTail: boolean };

const horses: Horse[] = [
  {
    type: "HORSE",
    name: "CHAMPION",
    legs: 3,
    hasTail: false
  },
  {
    type: "HORSE",
    name: "HOOVES_GALORE",
    legs: 4,
    hasTail: true
  }
];

// left :: E -> Either E never
export const left = <E>(value: E): Either<E, never> => ({
  type: "Left",
  value
});

// right :: A -> Either never A
const right = <A>(value: A): Either<never, A> => ({ type: "Right", value });

const getHorse = (name: string): Either<string, Horse> => {
  const found = horses.filter(horse => horse.name === name);
  return found[0] ? right(found[0]) : left(`Horse ${name} not found`);
};

// RENAME HORSE

const tidyHorseName = (horse: Horse): Horse => {
  return {
    ...horse,
    name:
      horse.name.charAt(0).toUpperCase() + horse.name.slice(1).toLowerCase()
  };
};

// STANDARDISE HORSES

type StandardHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "STANDARD_HORSE";
};

type TailCheckError =
  | { type: "HAS_NO_TAIL" }
  | { type: "TOO_MANY_LEGS" }
  | { type: "NOT_ENOUGH_LEGS" };

const standardise = (horse: Horse): Either<TailCheckError, StandardHorse> => {
  if (!horse.hasTail) {
    return left({ type: "HAS_NO_TAIL" });
  }
  if (horse.legs < 4) {
    return left({ type: "NOT_ENOUGH_LEGS" });
  }
  if (horse.legs > 4) {
    return left({ type: "TOO_MANY_LEGS" });
  }
  return right({
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "STANDARD_HORSE"
  });
};

// map :: (A -> B) -> Either E A -> Either E B
const map = <E, A, B>(fn: (a: A) => B, either: Either<E, A>): Either<E, B> =>
  either.type === "Left" ? either : right(fn(either.value));

// bind :: (A -> Either E B) -> Either E A -> Either E B
const bind = <E, A, B>(
  fn: (a: A) => Either<E, B>,
  either: Either<E, A>
): Either<E, B> => (either.type === "Left" ? either : fn(either.value));

// leftMap :: (E -> G) -> Either E A -> Either G A
const leftMap = <E, G, A>(
  fn: (e: E) => G,
  either: Either<E, A>
): Either<G, A> => (either.type === "Right" ? either : left(fn(either.value)));

// id :: A -> A
const id = <A>(a: A): A => a;

// bimap :: (E -> G) -> (A -> B) -> Either E A -> Either G B
const bimap = <E, G, A, B>(
  leftFn: (E: E) => G,
  rightFn: (a: A) => B,
  either: Either<E, A>
): Either<G, B> =>
  either.type === "Left"
    ? left(leftFn(either.value))
    : right(rightFn(either.value));

// match :: (E -> B) -> (A -> B) -> Either E A -> B
const match = <E, A, B>(
  left: (e: E) => B,
  right: (a: A) => B,
  either: Either<E, A>
): B => (either.type === "Left" ? left(either.value) : right(either.value));

// we can rewrite map and leftMap using bimap and id

const showHorseError = (err: TailCheckError): string => {
  switch (err.type) {
    case "TOO_MANY_LEGS":
      return `This horse has too many legs`;
    case "NOT_ENOUGH_LEGS":
      return `This horse has a less than standard number of legs`;
    case "HAS_NO_TAIL":
      return "This horse has no tail";
  }
};

const horseFinder2 = (name: string): Either<string, StandardHorse> => {
  const horse = getHorse(name);

  const tidyHorse = map(tidyHorseName, horse);

  return bind(horse => leftMap(showHorseError, standardise(horse)), tidyHorse);
};

type Tuple<A, B> = { type: "Tuple"; a: A; b: B };

// partitionEithers :: Array (Either E A) -> Tuple (Array E) (Array A)
