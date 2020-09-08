---
title: Lesson 2 - Either / Tuple
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

# Part 2

##  if it isn't there, why isn't it?

So last time we looked at `Maybe`, which can be

- `Just<thing>`

- or

- `Nothing`

## We've certainly gained some things

- compositionality

- (hopefully) easier to follow

- generally feeling clever

## But what have we lost?

- Let's look back to our horse getting

```typescript
const getHorse = (name: string): Maybe<Horse> => {
  const found = goodHorses.find(horse => horse.name === name)
  return found ? just(found) : nothing()
}
```

- `nothing` is all very well but it doesn't tell us why we are sitting here
  without any horse.

## Errors

- One solutions could be to throw errors like the good old days?

```typescript
const getHorse = (name: string): Horse => {
  const found = goodHorses.find(horse => horse.name === name)
  if (!found) {
    throw Error(`Horse ${name} not found`)
  }
  return found 
}
```

- ...and catch them down the line to see what happened.

```typescript
let maybeHorse
try {
  maybeHorse = getHorse("FAST-BOY")
} catch (e: string) {
  // do something with the Error
}
```

- There's something wrong here though

That `e` isn't really a `string`, it's `any`, as it could also be telling us we
are out of disk space or memory.

- What else can we do?

## Enter, Either

```typescript
type Either<E,A> = { type: "Left", value: E }
                 | { type: "Right", value: A }
```

- It represents any two outcomes, but usually...

- `Left` describes the failure case

- `Right` describes the success case

## A note

- You can also see this called `Result` with `Failure` and `Success`

- `Either` and `Result` are semantically the same

- If you wish to sound clever you can say they are `isomorphic` to one another. 

- This means you can swap between the two at will without losing any
  information

- We'll stick to `Either` though.

## Let's crack open a couple of constructor functions

- `Left :: E -> Either<E, never>`

```typescript
const left = <E>(value: E): Either<E,never> =>
  ({ type: "Left", value })

left("egg")
// { type: "Left", value: "egg" }
```

- `Right :: A -> Either<never, A>`

```typescript
const right = <A>(value: A): Either<never,A> => 
  ({ type: "Right", value })

right("leg")
// { type: "Right", value: "leg" }
```

## An example, if we must

Now when something fails, we can say why

```typescript
const divide = (dividend: number, divisor: number): Either<string, number> => {
  if (divisor === 0) {
    return left("Cannot divide by zero")
  }
  return right(dividend / divisor)
}
```

- When things go well...

```typescript
divide(10,2)
// { type: "Right", value: 5 }
```

- Or when they don't...

```typescript
divide(100,0)
// { type: "Left", value: "Cannot divide by zero" }
```

## A recap regarding Horses

- Let's go back to our beloved example involved horses, now with extra
  `Either`.

```typescript
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
```

## Step 1 - Find Horse

- `getHorse :: String -> Either String Horse`

```typescript
const getHorse = (name: string): Either<string, Horse> => {
  const found = horses.filter(horse => horse.name === name)
  return found[0] ? right(found[0]): left(`Horse ${name} not found`)
}
```

## Step 2 - Tidy Horse Name

- `tidyHorseName :: Horse -> Horse`

```typescript
const tidyHorseName = (horse: Horse): Horse => 
  ({
    ...horse,
    name: horse.name.charAt(0).toUpperCase() + 
        horse.name.slice(1).toLowerCase()
  })
```

## Step 3 - Standardise Horse

- Some types...

```typescript
type StandardHorse = {
  name: string;
  hasTail: true;
  legs: 4;
  type: "STANDARD_HORSE";
};

type TailCheckError = { type: "HAS_NO_TAIL" } 
                    | { type: "TOO_MANY_LEGS" } 
                    | { type: "NOT_ENOUGH_LEGS" }
```

- `standardise :: Horse -> Either TailCheckError StandardHorse`

```typescript
const standardise = (horse: Horse): Either<TailCheckError,StandardHorse> => {
  if (!horse.hasTail) {
    return left({ type: "HAS_NO_TAIL" })
  }
  if (horse.legs < 4) {
    return left({ type: "NOT_ENOUGH_LEGS" })
  }
  if (horse.legs > 4) {
    return left({ type: "TOO_MANY_LEGS" })
  }
  return right({
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: "STANDARD_HORSE"
  })
};
```

## What we want

- `horseFinder2 :: String -> Either String StandardHorse`

- Over to you...

## Great work.

- You are very smart.

## Algebraic Data Types

- So `Maybe` and `Either` are both examples of `Algebraic Data Types`

- More accurately, `sum types`

- To explain this, we need to talk about *CARDINALITY*

## What the fuck?

*Cardinality* is defined by the first result in a Google search I just did as: 

- `the number of elements in a set or other grouping, as a property of that grouping.`

- tldr; the cardinality of a type is how many different things it could be

- `Boolean` can be `true` or `false`

- so...? 

- Yes, indeed, `2`.

- `type TrafficLights = 'Red' | 'Green' | 'Blue'` ..?

- of course, `4`.

- I mean `3`. Lolle.

- The cardinality of `string` or `number` is very large indeed 

## Sum types

- `Maybe A` is a `sum type` because it's *cardinality* is 

- the sum of `whatever the cardinality of A is` and `1`

- The `1` is to represent `Nothing`

- `Maybe<boolean>` can be `Just(true)`, `Just(false)`, `Nothing`.

- So, `3`.

## Either

- `Either E A` is also a sum type, but it's `cardinality` is

- the sum of `the cardinality of E` and `the cardinality of A`

- so `E + A`, sort of (if you squint)

- So `Either<boolean, boolean>` would be `4`.

- or `Either<TrafficLights, boolean>` would be `5`.
 
## The other kind of ADT

- `Sum types` have a cousin (or *categorical dual*, maths fans) called `Product types`.

- They are way more boring tbh.

- A simple product type is `Tuple A B`
```typescript
type Tuple<A,B> = { type: "Tuple", a: A, b: B }
```

- Whereas with a `sum type` only the values from only one branch will be there, in `product
types` they are always there, therefore we calculate the `cardinality` by
multiplying the values of each type inside it.

- Therefore the cardinality of `Tuple<TrafficLights, Boolean>` would be...?

- Yes.

- You are probably right.

- Note: yes, we could also represent a `Tuple` like this of course:
```typescript
type Tuple<A,B> = [A,B]
```

- That would be fine.

## Examples in nature

Product types are way more boring than sums because they already exist
everywhere

- Most JS objects are `Product types`

```typescript
interface Person {
  name: string
  age: number
}
```

- Arrays, strictly aren't, operating more like

```typescript
[] | [A] | [A,A] | [A,A,A] | [A,A,A,A] ...
```

## Mixing them up

- It is quite normal that you'll find `sum` and `product` types mixed up in
  nature.

- This is quite natural and nothing to worry about.

```typescript
interface ExplodingBrainMeme {
  name: string
  dog: Maybe<Dog>
}
```

## Reducing complexity

- Thinking about types in terms of *cardinality* is super helpful because generally, reducing the number of possible values means
  having an easier time. 

- Look at this simple type:

```typescript
type ManyOptions = {
  type: 'electricity' | 'gas'
  eco7?: boolean
}
```

- How many options could there be above?

- What about now?

```typescript
type SlightlyLessOptions = {
  type: 'electricity',
  eco7: boolean
} | {
  type: 'gas'
}
```

- Because `product types` are about `multplication` of options, small changes
  quickly add up.

- Expand the example above, for instance...

```typescript
type ContrivedTariff = {
  type: 'electricity' | 'gas',
  eco7?: boolean
  elecReading?: number
  gasReading?: number
} 
```
 
## Extra homework task

Implement some things we made for `Either` for `Tuple`.

- `map :: (B -> D) -> Tuple A B -> Tuple A D`

- `leftMap :: (A -> C) -> Tuple A B -> Tuple C B`

- `bimap :: (A -> C) -> (B -> D) -> Tuple A B -> Tuple B D`

- `match :: (A -> B -> C) -> Tuple A B -> C`

- Why is implementing `join` or `bind` difficult?
