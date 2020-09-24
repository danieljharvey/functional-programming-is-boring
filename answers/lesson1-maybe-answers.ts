/*
 *
 * Let's make the above not terrible.
 *
 * first, we're going to need the following functions:
 */

export type Maybe<A> = { type: "Just"; value: A } | { type: "Nothing" };

// just :: A -> Maybe A

export const just = <A extends any>(a: A): Maybe<A> => ({
  type: "Just",
  value: a
});

// nothing :: () -> Maybe never

const nothing = (): Maybe<never> => ({ type: "Nothing" });

// map :: (A -> B) -> Maybe A -> Maybe B

const map = <A extends any, B extends any>(
  fn: (a: A) => B,
  maybe: Maybe<A>
): Maybe<B> => (maybe.type === "Just" ? just(fn(maybe.value)) : nothing());

// orElse :: (A -> B) -> B -> Maybe A -> B

const orElse = <A extends any, B extends any>(
  fn: (a: A) => B,
  def: B,
  maybe: Maybe<A>
): B => (maybe.type === "Just" ? fn(maybe.value) : def);

/*
 * Now let's use them to rewrite horseFinder
 */

// GO
type Horse = { type: "HORSE"; name: string; legs: number; hasTail: boolean };

type GoodHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "GOOD_HORSE";
};

const goodHorses: Horse[] = [
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

// getHorse :: string -> Maybe A

const getHorse = (name: string): Maybe<Horse> => {
  let found;
  goodHorses.forEach(goodHorse => {
    if (goodHorse.name === name) {
      found = goodHorse;
    }
  });
  if (found) {
    return just(found);
  }
  return nothing();
};

const tidyHorseName = (horse: Horse): Horse => {
  return {
    ...horse,
    name: horse.name.toLowerCase()
  };
};

const mandatoryTailCheck = (horse: Horse): Maybe<GoodHorse> => {
  if (!horse.hasTail || horse.legs !== 4) {
    return nothing();
  }
  return just({
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "GOOD_HORSE"
  });
};

// horseFinder :: String -> String

const horseFinder = (name: string): string => {
  const horse = getHorse(name);

  const tidyHorse = map(tidyHorseName, horse);

  const goodHorse = bind(mandatoryTailCheck, tidyHorse);

  return orElse(
    horse => `Found a good horse named ${horse.name}`,
    `${name} is not a good horse`,
    goodHorse
  );
};

// you may also find you need

// join :: Maybe (Maybe A) -> Maybe A

const join = <A extends any>(a: Maybe<Maybe<A>>): Maybe<A> =>
  a.type === "Just" ? a.value : nothing();

// or

// bind :: (A -> Maybe B) -> Maybe A -> Maybe B
const bind = <A, B extends any>(
  fn: (a: A) => Maybe<B>,
  maybs: Maybe<A>
): Maybe<B> => join(map(fn, maybs));

console.log(horseFinder("HOOVES_GALORE"));
