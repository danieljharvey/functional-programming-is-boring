---
title: Lesson 1 - Maybe
author: Daniel J Harvey
patat:
  wrap: true
  margins:
    left: 10
    right: 10
    top: 10
    bottom: 10
  incrementalLists: true
...

## Part 1

Dealing with things that may or maybe not be there.

```typescript
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
```

## How do we use this getHorse function?

- What if there isn't a match?

```typescript
const horse = getHorse("CHAMPION");

if (horse) {
  // do stuff with horse
}
```

- Seems fine I guess

## How do we change `horse`?

- Say we now need to tidy up those weird uppercase names

```typescript
const tidyHorseName = (horse: Horse): Horse => {
  return {
    ...horse,
    name: horse.name.toLowerCase()
  };
};
```

- But wait, we're not dealing with `horse`

- We're dealing with `horse | undefined`

- So we either make our horse tidying function more accomodating...

```typescript
const tidyHorseName = (horse: Horse | undefined): Horse | undefined => {
  if (!horse) {
    return undefined;
  }
  return {
    ...horse,
    name: horse.name.toLowerCase()
  };
};
```

- Or we are more careful about when we use it

```typescript
const horse = getHorse("CHAMPION");

const tidyHorse = horse ? tidyHorseName(horse) : undefined;
```

## One more thing

- Rules are rules, we are going to need to inspect this horse for a few things

- We are going to make a new type that describes the good horse

```typescript
type GoodHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "GOOD_HORSE";
};
```

- That way, we can use types to make sure we don't pass a bad horse where it's
  not wanted

- Here's our check:

```typescript
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
```

## How to use it

- Once again, we have two choices for dealing with the potential lack of `horse`

- We put the burden on the function itself:

```typescript
const mandatoryTailCheck = (
  horse: Horse | undefined
): GoodHorse | undefined => {
  if (!horse || !horse.hasTail || horse.legs !== 4) {
    return undefined;
  }
  return {
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "GOOD_HORSE"
  };
};
```

- Or we put the burden on the caller of the function:

```typescript
const horse = getHorse("CHAMPION");

const tidyHorse = horse ? tidyHorseName(horse) : undefined;

const goodHorse = tidyHorse ? mandatoryTailCheck(tidyHorse) : undefined;
```

## Which do you prefer?

- .

- ..

- ...

- If you chose **none of them, i want more abstraction** then you are correct

## A solution

- What about a function that turns our normal function into a careful function?

```typescript
const perhapsMap = <A, B>(
  func: (a: A) => B,
  value: A | undefined
): B | undefined => {
  if (value) {
    return func(value);
  }
  return undefined;
};
```

- And another to give us a default value at the end if we couldn't find
  anything?

```typescript
const orElse = <A>(perhapsValue: A | undefined, def: A): A =>
  perhapsValue || def;
```

## Pretty neat right?

- We could then use it like this?

```typescript
const horseFinder = (name: string): string => {
  const horse = getHorse(name);

  const tidyHorse = perhapsMap(tidyHorseName, horse);

  const goodHorse = perhapsMap(mandatoryTailCheck, tidyHorse);

  const horseMessage = perhapsMap(
    horse => `Found a good horse named ${horse.name}`,
    goodHorse
  );

  return orElse(horseMessage, `${name} is not a good horse`);
};
```

- OK?

```typescript
horseFinder("JULIAN"); // "julian is not a good horse"
horseFinder("CHAMPION"); // "Found a good horse named champion"
```

- I think we can do better though....

## Discriminated unions

- We're familiar with **union types** right?

```typescript
type Fuel = string | null | number;
```

- A **discriminated union** is a union where there is some sort of unique key

```typescript
// like Redux actions, innit
type Smash = {
  type: "SMASH_THAT_LIKE_BUTTON";
  timestamp: number;
};

type GiveUp = {
  type: "GIVE_UP";
};

type Action = Smash | GiveUp;
```

- (said unique key is the **discriminator**, surprise)

- There is no magic here, it just means we can easily switch on it

- Like a Redux reducer

```typescript
const weirdReducer = (action: Action) {
  switch (action.type) {
    case 'SMASH_THAT_LIKE_BUTTON':
      return action.timestamp // Typescript knows this should be here
    case 'GIVE_UP':
      return 0
  }
}
```

## Maybe

Maybe is a container for holding things that may or may not be there:

```typescript
type Maybe<A> = { type: "Just"; value: A } | { type: "Nothing" };
```

- Because it uses a generic parameter, we can make a `Maybe<string>` or a
  `Maybe<number>`, depending on what it (maybe) contains.

- We can make some nice helpers for these:

`just :: a -> Maybe a`

```typescript
const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

const a = just("horses");
// a == { type: "Just", value: "horses" }
```

- and...

`nothing :: () -> maybe never`

```typescript
const nothing = (): Maybe<never> => ({ type: "Nothing" });

const b = nothing();
// b == { type: "Nothing" }
```

## Examples in action

- We can then return this where we would have partial data

`getHorse :: string -> Maybe Horse`

```typescript
const getHorse = (name: string): Maybe<Horse> => {
  const found = goodHorses.find(goodHorse => goodHorse.name === name);
  return found ? just(found) : nothing();
};
```

- Example 1

```typescript
getHorse("CHAMPION")
/*
{ type: "Just",
  value:{
    type: "HORSE",
    name: "CHAMPION",
    legs: 3,
    hasTail: false,
  }
}
```

- Example 2

```typescript
getHorse("NON-EXISTANT-HORSE")
/*
{ type: "Nothing" }
/*
```

## There's no reason we can't make 'smart constructors' for Maybe values too

`fromMissing :: A | undefined -> Maybe a`

```typescript
const fromMissing = <A>(value: A | undefined): Maybe<A> =>
  value ? just(value) : nothing();
```

```typescript
fromMissing("dog")
// { type: "Just", value: "Dog" }
```

```typescript
fromMissing(undefined)
// { type: "Nothing" }
```

## How would we use these to make the horse finding function nicer?

- Down to you...

## Answers

- These are not the only answers, but some answers

- map

`map :: (A -> B) -> Maybe A -> Maybe B`

```typescript
const map = (func: (a: A) => B, maybe: Maybe<A>): Maybe<B> =>
  maybe.type === "Just" ? { type: "Just", value: func(maybe.value) } : maybe;
```

- orElse

`orElse :: (A -> B) -> B -> Maybe A -> Maybe B`

```typescript
const orElse = (func: (a: A) => B, def: B, maybe: Maybe<A>): Maybe<B> =>
  maybe.type === "Just" ? func(maybe.value) : def
```

- join

`join :: Maybe (Maybe A) -> Maybe A`

```typescript
const join = (value: Maybe<Maybe<A>>): Maybe<A> => 
  value.type === 'Just' ? value.value : nothing()
```

- bind

`bind :: (A -> Maybe B) -> Maybe A -> Maybe B`

```typescript
const bind = (func: (a: A) => Maybe B, value: Maybe<A>): Maybe<B> => 
  value.type === 'Just' ? func(value.value) : nothing()
```

## A note on currying

Often in functional languages (or indeed, in libraries like `Ramda` or `fp-ts`)
our functions are `curried`

This means they are split into single arity functions that each return the rest
of the function.

The regular example is this:

```typescript
const add = (a,b) => a + b
```

- becoming this...

```typescript
const addCurried = a => b => a + b
```

- which allows

```typescript
const add2 = addCurried(2)

add2(1) // 3
```

- This is used a lot so that functions like `map` and `bind` can be used
  point-free.

- It does make things a lot more dense though

## One last thing

- https://egghead.io/lessons/javascript-you-ve-been-using-monads
