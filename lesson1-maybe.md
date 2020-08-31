---
title: Lesson 1 - Maybe 
author: Daniel J Harvey 
patat:
    incrementalLists: true
...

# Part 1

Dealing with things that may or maybe not be there.

```typescript
type Horse = { type: "HORSE", name: string, legs: number, hasTail: boolean }

const goodHorses: Horse[] = [
  {
    type: "HORSE",
    name: "CHAMPION", 
    legs: 3,
    hasTail: false,
  },
  {
    type: "HORSE",
    name: "HOOVES_GALORE",
    legs: 4,
    hasTail: true
  }
]

const getHorse = (name: string) => {
  let found
  goodHorses.forEach(goodHorse => {
    if (goodHorse.name === name) {
      found = goodHorse
    }
  })
  return found
}
```

# How do we use this getHorse function?

- What if there isn't a match?

```typescript
const horse = getHorse('CHAMPION')

if (horse) {
  // do stuff with horse 
}
```

- Seems fine I guess

# How do we change `horse`?

- Say we now need to tidy up those weird uppercase names

```typescript
const tidyHorseName = (horse: Horse): Horse => {
  return {
    ...horse,
    name: horse.name.toLowerCase()
  } 
}
```

- But wait, we're not dealing with `horse`

- We're dealing with `horse | undefined`

- So we either make our horse tidying function more accomodating...

```typescript
const tidyHorseName = (horse: Horse | undefined): Horse | undefined => {
  if (!horse) {
    return undefined
  }
  return {
    ...horse,
    name: horse.name.toLowerCase()
  } 
}
```

- Or we are more careful about when we use it

```typescript
const horse = getHorse('CHAMPION')

const tidyHorse = horse ? tidyHorseName(horse) : undefined
```

# One more thing

- Rules are rules, we are going to need to inspect this horse for a few things 

- We are going to make a new type that describes the good horse

```typescript
type GoodHorse = {
  name: string,
  hasTail: true
  legs: 4
  type: 'GOOD_HORSE'
}
```

- That way, we can use types to make sure we don't pass a bad horse where it's
  not wanted

- Here's our check:

```typescript
const mandatoryTailCheck = (horse: Horse): GoodHorse | undefined => {
  if (!horse.hasTail || horse.legs !== 4) {
    return undefined
  }
  return {
    name: string,
    hasTail: true,
    legs: 4,
    type: "GOOD_HORSE"
  }
}
```

# How to use it

- Once again, we have two choices for dealing with the potential lack of `horse`

- We put the burden on the function itself:

```typescript
const mandatoryTailCheck = (horse: Horse | undefined): GoodHorse | undefined => {
  if (!horse || !horse.hasTail || horse.legs !== 4) {
    return undefined
  }
  return {
    name: string,
    hasTail: true,
    legs: 4,
    type: "GOOD_HORSE"
  }
}
```

- Or we put the burden on the caller of the function:

```typescript
const horse = getHorse('CHAMPION')

const tidyHorse = horse ? tidyHorseName(horse) : undefined

const goodHorse = tidyHorse ? mandatoryTailCheck(tidyHorse) : undefined
```

# Which do you prefer?

- .

- ..

- ...

- If you chose __none of them, i want more abstraction__ then you are correct

# A solution

- What about a function that turns our normal function into a careful function?

```typescript
const perhapsMap = <A,B>(func: (a:A) => B, perhapsValue: A | undefined): B | undefined => {
  if (perhapsValue) {
    return func(perhapsValue)
  }
  return undefined
}
```

- We could then use it like this?

```typescript
const horse = getHorse('CHAMPION')

const tidyHorse = perhapsMap(tidyHorseName, horse)

const goodHorse = perhapsMap(mandatoryTailCheck,tidyHorse)
```



# Discriminated unions

- We're familiar with __union types__ right?

```typescript
type Fuel = string | null | number
```

- A __discriminated union__ is a union where there is some sort of unique key

```typescript
// like Redux actions, innit
type Smash = { 
  type: "SMASH_THAT_LIKE_BUTTON",
  timestamp: number
}

type GiveUp = {
  type: "GIVE_UP"
}

type Action = Smash | GiveUp
```

- (said unique key is the __discriminator__, surprise)

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

# Maybe

Maybe is a container for holding things that may or may not be there:

```typescript
type Maybe<A> = { type: "Just", value: A } | { type: "Nothing" }
```

- We can make some nice helpers for these:

```typescript
const just = <A>(value: A): Maybe<A> => ({ type: "Just", value })

const nothing = (): Maybe<never> => ({ type: Nothing" })
```

- We can then return this where we would have partial data

```typescript
const getHorse = (name: string): Maybe<Horse> => {
  const found = goodHorses.find(goodHorse => goodHorse.name === name)
  return found ? just(found) : nothing()
}
```

- Or even make another helper

```typescript
const fromMissing = <A>(value: A | undefined): Maybe<A> => 
  value ? just(value) : nothing()
```

- And make `getHorse` even smaller

```typescript
const getHorse = (name: string): Maybe<Horse> => 
  fromMissing(goodHorses.find(goodHorse => goodHorse.name === name))
```

