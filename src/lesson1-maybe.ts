export type Horse = {
  type: "HORSE";
  name: string;
  legs: number;
  hasTail: boolean;
};

export const standardHorses: Horse[] = [
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
  standardHorses.forEach(standardHorse => {
    if (standardHorse.name === name) {
      found = standardHorse;
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

type StandardHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "STANDARD_HORSE";
};

const mandatoryTailCheck = (horse: Horse): StandardHorse | undefined => {
  if (!horse.hasTail || horse.legs !== 4) {
    return undefined;
  }
  return {
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "STANDARD_HORSE"
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

const valueOrElse = <A, B>(
  perhapsValue: A | undefined,
  func: (a: A) => B,
  def: B
): B => (perhapsValue ? func(perhapsValue) : def);

const horseFinder = (name: string): string => {
  const horse = getHorse(name);

  const tidyHorse = perhapsMap(tidyHorseName, horse);

  const standardHorse = perhapsMap(mandatoryTailCheck, tidyHorse);

  return valueOrElse(
    standardHorse,
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
export const just = undefined as any;

// nothing :: () -> Maybe never
export const nothing = undefined as any;

// map :: (A -> B) -> Maybe A -> Maybe B
export const map = undefined as any;

// orElse :: (A -> B) -> B -> Maybe A -> B
export const orElse = undefined as any;

export const bind = undefined as any;

// newGetHorse :: String -> Maybe<Horse>
export const newGetHorse = undefined as any;

// newMandatoryTailCheck :: Horse -> Maybe<StandardHorse>
export const newMandatoryTailCheck = undefined as any;

// newHorseFinder :: String -> String
export const newHorseFinder = undefined as any;
