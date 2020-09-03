type Horse = { type: "HORSE"; name: string; legs: number; hasTail: boolean };

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

const getHorse = (name: string) => {
  let found;
  goodHorses.forEach(goodHorse => {
    if (goodHorse.name === name) {
      found = goodHorse;
    }
  });
  return found;
};

const tidyHorseName = (horse: Horse): Horse => {
  return {
    ...horse,
    name: horse.name.toLowerCase()
  };
};

type GoodHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "GOOD_HORSE";
};

const mandatoryTailCheck = (horse: Horse): GoodHorse | undefined => {
  if (!horse.hasTail || horse.legs !== 4) {
    return undefined;
  }
  return {
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "GOOD_HORSE"
  };
};

const perhapsMap = <A, B>(
  func: (a: A) => B,
  value: A | undefined
): B | undefined => {
  if (value) {
    return func(value);
  }
  return undefined;
};

const orElse = <A,B>(
  perhapsValue: A | undefined,
  func: (a: A) => B,
  def: B
): B => (perhapsValue ? func(perhapsValue) : def);

const horseFinder = (name: string): string => {
  const horse = getHorse(name);

  const tidyHorse = perhapsMap(tidyHorseName, horse);

  const goodHorse = perhapsMap(mandatoryTailCheck, tidyHorse);

  return orElse(
    goodHorse,
    horse => `Found a good horse named ${horse.name}`,
    `${name} is not a good horse`
  );
};

/*
 *
 * Let's make the above not terrible.
 *
 * first, we're going to need the following functions:
 */

type Maybe<A> = { type: "Just"; value: A } | { type: "Nothing" };

// just :: A -> Maybe A

// nothing :: () -> Maybe never

// map :: (A -> B) -> Maybe A -> Maybe B

// orElse :: (A -> B) -> B -> Maybe A -> Maybe B

/*
 * Now let's use them to rewrite horseFinder
 */

// GO

// horseFinder :: String -> String

// you may also find you need

// join :: Maybe (Maybe A) -> Maybe A

// or

// bind :: (A -> Maybe B) -> Maybe A -> Maybe B
