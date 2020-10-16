---
title: Lesson 5 - Optics 
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

# Part 6

## Optics

So last time we looked at `Reader`, which is a way of getting around all those
variables we were dragging around.

There's another cost of immutability we haven't yet talked about.

## The good old days

Say I've got this big lump 'o' data here:

```typescript
const bigLumpOData = {
  statusCode: 201,
  data: {
    timestamp: 100,
    stable: {
      postcode: "N1 1SL",
      owner: {
        name: "Ultimate Steve",
        age: 1000
      },
      horse: {
        name: "CHAMPION",
        age: 10,
        numberOfLegs: 3,
        hasTail: true
      }
    }
  }
};
```

- I want to change a minor part of it

- Perhaps, the age of _Ultimate Steve_

- No problem!
```typescript
bigLumpOData.data.stable.owner.age = 56
```

- Nailed it.

## But then everybody's all like

__"Oh, but that's mutation, that's bad, and as a result, you are an awful person"__

- What can we do instead?

- .....

- ....

- ...

- ..

- .

## If you suggested something like this...

```typescript
const newData = {
  ...bigLumpOData,
  data: {
    ...bigLumpOData.data,
    stable: {
      ...bigLumpOData.data.stable,
      horse: {
        ...bigLumpOData.data.stable.owner,
        age: 11
      }
    }
  }
}
```

- then yes.

- But also on so many levels __ABSOLUTELY NO THANK YOU__ 

- _"Surely There Is Some Sort Of Abstraction We Could Use Here?"_

## Optics 

- Optics are a family of abstractions that we use to mess with data

- We are going to look at the most common one today, `lens`.

- A lens is so named because we use it to peer into data

- If you've created `selectors` in `React`, you're halfway there

- Lenses look something like this: `Lens<S,A>`

- The `S` is the large piece of data

- and the `A` is the sub piece of data we're zooming into

- Therefore if we had a `Horse`:
```typescript
type Horse = {
   name: string
   numberOfLegs: number
}
```

- ...then a `numberOfLegsLens` could have type `Lens<Horse, number>`

- Clear as mud?

## Using it

We're going to use the `Monocle-ts` library for lenses.

- It's a member of the `fp-ts` family, and is a port of the `monocle` library
  in `Scala`.

- We would create our number of legs lens like this:
```typescript
import { Lens } from "monocle-ts";

const numberOfLegsLens = Lens.fromProp<Horse>()('numberOfLegs')
```

- Let's break this down:

- We import `Lens`, good, sure.

- `fromProp`, that's a function, nailed it.

- `<Horse>` - that the `S` we talked about - we need to tell the library what
  it is we're peering into.

- `()` - Because everything in this library is curried, this is required so we
  are able to pass the `Horse` type param. I'm not sure this is _good_ but we
can live with it.

- `('numberOfLegs')` - the property we want to look at. Typescript is clever
  and can work out the output type from this.

## Using it part 2 - actually using it

Ok, let's do it

```typescript
const horse: Horse = {
  name: "RELENTLESS_BOUNDER",
  numberOfLegs: 3
}

const legs = numberOfLegsLens.get(horse)
// legs == 3
```

- Pretty great huh!

- That's not all `Lens` can do though.

- It has three operations:

- `get :: Lens S A -> S -> A`

- `set :: Lens S A -> S -> A -> S`

- `over :: Lens S A -> (A -> A) -> S -> S`

- (A nice intuition for `over` is that it lets you jump anywhere in some data
  and start mapping over it)

## Doing a set with the setter

Let's see `set` in action:

```typescript
const horse: Horse = {
  name: "RELENTLESS_BOUNDER",
  numberOfLegs: 3
}

const newHorse: Horse = numberOfLegsLens.set(4)(horse)

const legs = numberOfLegsLens.get(newHorse)
// legs == 4
```

## Over and over and over

Alternatively, we can map over the `numberOfLegs`

```typescript
const horse: Horse = {
  name: "CHAMPION",
  numberOfLegs: 3
}

const legIncrementer = (num: number): number => num + 1 

const newHorse: Horse = numberOfLegsLens.over(legIncrementer)(horse)

const legs = numberOfLegsLens.get(newHorse)
// legs == 4
```

## Composition

Now this is all well and good, but what really gets functional programmers
excited about `lenses` is __COMPOSABILITY__

- Say I have:

```typescript
type Data = {
  blah: {
    horse: Horse
  }
}

const data: Data= {
  blah: {
    horse: {
      horseName: "EGG"
    }
  }
}
```

- I can make a `blah` lens:
```typescript
const blahLens = Lens.fromProp<Data>()('blah')
```

- and a `horse` lens:
```typescript
const horseLens = Lens.fromProp<Data['blah']>()('horse')
```

- and compose them together to make a big lens: 
```typescript
const bigHorseLens = blahLens.compose(horseLens)
```

- This makes `horseLens :: Lens Data Horse` 

## This is all wildly abstract

Let's give it a smash...
