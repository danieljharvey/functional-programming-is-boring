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

## Alternatives - a nice pattern

Our code here suggests a fairly linear path, but the truth is that most things
aren't so simple.

- Imagine for a moment, that there is a second source of horses.

```typescript
const otherHorses: Horse[] = [
  {
    type: "HORSE",
    name: "ROAST_BEEF",
    legs: 2,
    hasTail: false
  },
  {
    type: "HORSE",
    name: "INFINITE_JEFF",
    legs: 5,
    hasTail: true
  }
];
```

- Therefore, when doing `getHorse` we have two places we can look.

- The first place is preferable though.

## Great

- We could adapt this function to take the horse source as a parameter..

```typescript
const getHorse2 = (possibleHorses: Horse[]) => 
  (name: string): Either<string, Horse> => {
    const found = possibleHorses.filter(horse => horse.name === name)
    return found[0] ? right(found[0]): left(`Horse ${name} not found`)
}
```

- But how do we try one and then the other?

- Now, what if, we had a function, with a type signature that looked like this?

- `alt :: Either E A -> Either E A -> Either E A`

- Or indeed, for `Maybe`:

- `alt :: Maybe A -> Maybe A -> Maybe A`
 
- Let's try fixing our horse issues with these:


## Measuring complexity

- Reducing complexity is good, and so it's helpful to have a way of measuring
  it. 

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

- A small change reduces the number of options, and thus the number of code
  paths needed to deal with it.

- Although it's trivial now, as a data type grows it becomes more significant. 

```typescript
type ContrivedTariff = {
  type: 'electricity' | 'gas',
  eco7?: boolean
  elecReading?: number
  gasReading?: number
} 
```

## How do we measure it? 

This measure of how many possible values exist in a type is called *cardinality*.

- It is defined by the first result in a Google search I just did as: 

`the number of elements in a set or other grouping, as a property of that grouping.`

- `Boolean` can be `true` or `false`

- so...? 

- Yes, indeed, `2`.

- `type TrafficLights = 'Red' | 'Green' | 'Blue'` ..?

- of course, `4`.

- I mean `3`. Lolle.

- The cardinality of `string` or `number` is very large indeed 

- How does this relate to our new friends `Either` and `Maybe`?

## Algebraic Data Types

- So `Maybe` and `Either` are both examples of `Algebraic Data Types`

- More accurately, `sum types`

- (The other kind are `product types`, we'll come to those...)

## Maybe 

- `Maybe A` is a `sum type` because it's *cardinality* is 

- the sum of `whatever the cardinality of A is` and `1`

- So `A` + `1`, kinda.

- (The `1` is to represent `Nothing`)

- The type `Maybe<boolean>` could have values of either 

- `Just(true)`

- `Just(false)`

- `Nothing`

- So, `3`.

## Either

- `Either E A` is also a sum type, but it's `cardinality` is

- the sum of `the cardinality of E` and `the cardinality of A`

- so `E + A`, sort of (if you squint)

- So `Either<boolean, boolean>` would be `2` + `2` = `4`

- or `Either<TrafficLights, boolean>` would be `3` + `2` = `5`.

## This is complex

But how does it relate to complexity?

- Bare with me - I swear we're getting to a breakthrough
 
## Product types 

- `Product types` are the other kind of `Algebraic Data Type` (`ADT`)

- They are way more boring tbh.

- Most Typescript interfaces are `Product types`
```typescript
interface Person {
  name: string
  age: number
}
```

- When it comes to data modelling, they are the probably the tool we reach for
  first.

- (And why wouldn't we? They are broadly supported and it's considered idiomatic
  to do so.)

- (And I'm not writing a thinkpiece named __Javascript Objects Considered Harmful__ or anything)

- (yet)

## Anyway

- Whilst `sum types` describe `this` *OR* `that`.

- `Product types` describe `this` *AND* `that`.

- So, a `Person` interface is just a nice way of carrying around a `string` *AND* a `number`

## Tuple

- A good example of how these things are actually very similar is `Tuple`.

- A very simple simple product type is `Tuple A B`

- We could represent it like this:
```typescript
type Tuple<A,B> = { type: "Tuple", a: A, b: B }
```

- It is the *dual* of `Either`...

- `Either<A,B>` is `A` *+* `B`.

- `Tuple<A,B>` is `A` *x* `B`.

- A `Tuple<string,number>` could represent `Person` interface from before as
  it's their `name` *AND* `age`.

- Whilst `Either<string,number>` could be used to describe a person's `name` *OR*
  `age`.

- (I'm not sure why you would do this, admittedly)

- So, knowing that the *cardinality* of `Either<TrafficLights, boolean>` is `5`

- What is *cardinality* of `Tuple<TrafficLights, Boolean>`...?

- .

- ..

- ...

- `3` x `2` = `6`

## Complexity, to recap

- We calculate the cardinality of a `sum type` with `+`

- But for `product types` we use `x`

- You can imagine which ones end up bigger

- Adding another `boolean` multipies the options by `2`.

- And adding an `optional boolean` multiplies the options by `3`.

- So wherever you find yourself adding more rows to a type, think

- Will this __REALLY__ always be there?

- Or can I make it a `sum` instead?

## Extra task time 

- Given a constructor for making `Tuple` types: 
```typescript
const tuple = <A,B>(a: A, b: B): Tuple<A,B> =>
  ({ type: "Tuple", a, b })

tuple("Horse", 100)
// { type: "Tuple", a: "Horse", b: 100 })
```

- ...can we implement some of the functions we made for `Either` for `Tuple`?

- `map :: (B -> D) -> Tuple A B -> Tuple A D`

- `leftMap :: (A -> C) -> Tuple A B -> Tuple C B`

- `bimap :: (A -> C) -> (B -> D) -> Tuple A B -> Tuple B D`

- `match :: (A -> B -> C) -> Tuple A B -> C`

- Why is implementing `join` or `bind` difficult?

- Isn't it weird we're writing the same shitty functions over and over?
