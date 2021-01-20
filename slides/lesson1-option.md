## Part 1

Dealing with things that may or may not be there.

```typescript
type Horse = {
  type: 'HORSE'
  name: string
  legs: number
  hasTail: boolean
}

const goodHorses: Horse[] = [
  {
    type: 'HORSE',
    name: 'CHAMPION',
    legs: 3,
    hasTail: false,
  },
  {
    type: 'HORSE',
    name: 'HOOVES_GALORE',
    legs: 4,
    hasTail: true,
  },
]

const getHorse = (name: string) => {
  let found
  goodHorses.forEach((goodHorse) => {
    if (goodHorse.name === name) {
      found = goodHorse
    }
  })
  return found
}
```

## How do we use this getHorse function?

- What if there isn't a match?

```typescript
const horse = getHorse('CHAMPION')

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
    name: horse.name.toLowerCase(),
  }
}
```

- But wait, we're not dealing with `Horse`

- We're dealing with `Horse | undefined`

- So we either make our horse tidying function more accomodating...

```typescript
const tidyHorseName = (
  horse: Horse | undefined
): Horse | undefined => {
  if (!horse) {
    return undefined
  }
  return {
    ...horse,
    name: horse.name.toLowerCase(),
  }
}
```

- Or we are more careful about when we use it

```typescript
const horse = getHorse('CHAMPION')

const tidyHorse = horse ? tidyHorseName(horse) : undefined
```

## One more thing

- Rules are rules, we are going to need to inspect this horse for a few things

- We are going to make a new type that describes the good horse

```typescript
type GoodHorse = {
  name: string
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
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: 'GOOD_HORSE',
  }
}
```

## How to use it

- Once again, we have two choices for dealing with the potential lack of `horse`

- We put the burden on the function itself:

```typescript
const mandatoryTailCheck = (
  horse: Horse | undefined
): GoodHorse | undefined => {
  if (!horse || !horse.hasTail || horse.legs !== 4) {
    return undefined
  }
  return {
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: 'GOOD_HORSE',
  }
}
```

- Or we put the burden on the caller of the function:

```typescript
const horse = getHorse('CHAMPION')

const tidyHorse = horse ? tidyHorseName(horse) : undefined

const goodHorse = tidyHorse
  ? mandatoryTailCheck(tidyHorse)
  : undefined
```

## Which do you prefer?

- .

- ..

- ...

- If you chose **none of them, i want more abstraction** then you are correct

## Discriminated unions

- We're familiar with **union types** right?

```typescript
type Fuel = string | null | number
```

- A **discriminated union** is a union where there is some sort of unique key

```typescript
// like Redux actions, innit
type Smash = {
  type: 'SMASH_THAT_LIKE_BUTTON'
  timestamp: number
}

type GiveUp = {
  type: 'GIVE_UP'
}

type Action = Smash | GiveUp
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

## Option

Option is a container for holding things that may or may not be there:

```typescript
type Option<A> = { type: 'Some'; value: A } | { type: 'None' }
```

- Because it uses a generic parameter, we can make a `Option<string>` or a
  `Option<number>`, depending on what it (maybe) contains.

- We can make some nice helpers for these:

`some :: a -> Option a`

```typescript
const some = <A>(value: A): Option<A> => ({ type: 'Some', value })

const a = some('horses')
// a == { type: "Some", value: "horses" }
```

- and...

`none :: () -> option never`

```typescript
const none = (): Option<never> => ({ type: 'None' })

const b = none()
// b == { type: "None" }
```

## Examples in action

- We can then return this where we would have partial data

`getHorse :: string -> Option Horse`

```typescript
const getHorse = (name: string): Option<Horse> => {
  const found = goodHorses.find(
    (goodHorse) => goodHorse.name === name
  )
  return found ? some(found) : none()
}
```

- Example 1

```typescript
getHorse("CHAMPION")
/*
{ type: "Some",
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
{ type: "None" }
/*
```

## What about changing the value inside?

We can use a function called `map`:

```typescript
// map :: (A -> B) -> Option A -> Option B
const map = (f: (a: A) => B, option: Option<A>): Option<B> =>
  option.type === 'Some' ? some(f(option.value)) : none()
```

Think of it working like `Array.map` - if the `Array` is empty, nothing
happens, and if there's items inside, we run the function on it.

## How would we use these to make the horse finding function nicer?

- Down to you...
