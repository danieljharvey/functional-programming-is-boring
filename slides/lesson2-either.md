# Part 2

## If it isn't there, why isn't it?

So last time we looked at `Option`, which can be

- `Some<thing>`

- or

- `None`

## We've certainly gained some things

- compositionality

- (hopefully) easier to follow

- generally feeling clever

## But what have we lost?

- Let's look back to our horse getting

```typescript
const getHorse = (name: string): Option<Horse> => {
  const found = goodHorses.find(horse => horse.name === name)
  return found ? some(found) : none()
}
```

- `none` is all very well but it doesn't tell us why we are sitting here
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
let optionHorse
try {
  optionHorse = getHorse('FAST-BOY')
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
type Either<E, A> =
  | { type: 'Left'; value: E }
  | { type: 'Right'; value: A }
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
const left = <E>(value: E): Either<E, never> => ({
  type: 'Left',
  value,
})

left('egg')
// { type: "Left", value: "egg" }
```

- `Right :: A -> Either<never, A>`

```typescript
const right = <A>(value: A): Either<never, A> => ({
  type: 'Right',
  value,
})

right('leg')
// { type: "Right", value: "leg" }
```

## An example, if we must

Now when something fails, we can say why

```typescript
const divide = (
  dividend: number,
  divisor: number
): Either<string, number> => {
  if (divisor === 0) {
    return left('Cannot divide by zero')
  }
  return right(dividend / divisor)
}
```

- When things go well...

```typescript
divide(10, 2)
// { type: "Right", value: 5 }
```

- Or when they don't...

```typescript
divide(100, 0)
// { type: "Left", value: "Cannot divide by zero" }
```

## A recap regarding Horses

- Let's go back to our beloved example involved horses, now with extra
  `Either`.

```typescript
type Horse = {
  type: 'HORSE'
  name: string
  legs: number
  hasTail: boolean
}
```

- Here again, are our horses

```typescript
const horses: Horse[] = [
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
```

## Step 1 - Find Horse

- `getHorse :: String -> Either String Horse`

```typescript
const getHorse = (name: string): Either<string, Horse> => {
  const found = horses.filter(horse => horse.name === name)
  return found[0] ? right(found[0]) : left(`Horse ${name} not found`)
}
```

## Step 2 - Tidy Horse Name

- `tidyHorseName :: Horse -> Horse`

```typescript
const tidyHorseName = (horse: Horse): Horse => ({
  ...horse,
  name:
    horse.name.charAt(0).toUpperCase() +
    horse.name.slice(1).toLowerCase(),
})
```

## Step 3 - Standardise Horse

- Some types...

```typescript
type StandardHorse = {
  name: string
  hasTail: true
  legs: 4
  type: 'STANDARD_HORSE'
}

type TailCheckError =
  | { type: 'HAS_NO_TAIL' }
  | { type: 'TOO_MANY_LEGS' }
  | { type: 'NOT_ENOUGH_LEGS' }
```

- `standardise :: Horse -> Either TailCheckError StandardHorse`

```typescript
const standardise = (
  horse: Horse
): Either<TailCheckError, StandardHorse> => {
  if (!horse.hasTail) {
    return left({ type: 'HAS_NO_TAIL' })
  }
  if (horse.legs < 4) {
    return left({ type: 'NOT_ENOUGH_LEGS' })
  }
  if (horse.legs > 4) {
    return left({ type: 'TOO_MANY_LEGS' })
  }
  return right({
    name: horse.name,
    hasTail: true,
    legs: 4,
    type: 'STANDARD_HORSE',
  })
}
```

## What we want

- `horseFinder2 :: String -> Either String StandardHorse`

- Over to you...

## Alternatives - a nice pattern

Our code here suggests a fairly linear path, but the truth is that most things
aren't so simple.

- Imagine for a moment, that there is a second source of horses.

```typescript
const otherHorses: Horse[] = [
  {
    type: 'HORSE',
    name: 'ROAST_BEEF',
    legs: 2,
    hasTail: false,
  },
  {
    type: 'HORSE',
    name: 'INFINITE_JEFF',
    legs: 5,
    hasTail: true,
  },
]
```

- Therefore, when doing `getHorse` we have two places we can look.

- The first place is preferable though.

## Great

- We could adapt this function to take the horse source as a parameter..

```typescript
const getHorse2 = (possibleHorses: Horse[]) => (
  name: string
): Either<string, Horse> => {
  const found = possibleHorses.filter(horse => horse.name === name)
  return found[0] ? right(found[0]) : left(`Horse ${name} not found`)
}
```

- But how do we try one and then the other?

- Now, what if, we had a function, with a type signature that looked like this?

- `alt :: Either E A -> Either E A -> Either E A`

- Or indeed, for `Option`:

- `alt :: Option A -> Option A -> Option A`

- Let's try fixing our horse issues with these:
