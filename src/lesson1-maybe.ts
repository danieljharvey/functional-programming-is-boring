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

const horseFinder = (name: string): string => {
  const horse = getHorse(name);

  const tidyHorse = horse ? tidyHorseName(horse) : undefined;

  const standardHorse = tidyHorse ? mandatoryTailCheck(tidyHorse) : undefined;

  if (!standardHorse) {
    return `${name} is not a good horse`;
  }
  return `Found a good horse named ${standardHorse.name}`;
};

/*
 * Let's make the above more elegant and 10x
 *
 * first, we're going to need the following functions:
 */

type Maybe<A> = { type: "Just"; value: A } | { type: "Nothing" };

// just :: A -> Maybe A
export const just = <A>(a: A): Maybe<A> => ({ type: "Just", value: a });

// nothing :: () -> Maybe never
export const nothing = (): Maybe<never> => ({ type: "Nothing" });

// map :: (A -> B) -> Maybe A -> Maybe B
export const map = undefined as any;

// orElse :: (A -> B) -> B -> Maybe A -> B
export const orElse = undefined as any;

// bind :: (A -> Maybe B) -> Maybe A -> Maybe B
export const bind = undefined as any;

// newGetHorse :: String -> Maybe<Horse>
export const newGetHorse = undefined as any;

// newMandatoryTailCheck :: Horse -> Maybe<StandardHorse>
export const newMandatoryTailCheck = undefined as any;

// newHorseFinder :: String -> String
export const newHorseFinder = undefined as any;
