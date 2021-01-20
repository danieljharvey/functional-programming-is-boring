# Cardinality

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
type SlightlyLessOptions =
  | {
      type: 'electricity'
      eco7: boolean
    }
  | {
      type: 'gas'
    }
```

- A small change reduces the number of options, and thus the number of code
  paths needed to deal with it.

- Although it's trivial now, as a data type grows it becomes more significant.

```typescript
type ContrivedTariff = {
  type: 'electricity' | 'gas'
  eco7?: boolean
  elecReading?: number
  gasReading?: number
}
```

## How do we measure it?

This measure of how many possible values exist in a type is called _cardinality_.

- It is defined by the first result in a Google search I just did as:

`the number of elements in a set or other grouping, as a property of that grouping.`

- `Boolean` can be `true` or `false`

- so...?

- Yes, indeed, `2`.

- `type TrafficLights = 'Red' | 'Green' | 'Blue'` ..?

- of course, `4`.

- I mean `3`. Lolle.

- The cardinality of `string` or `number` is very large indeed

- How does this relate to our new friends `Either` and `Option`?

## Algebraic Data Types

- So `Option` and `Either` are both examples of `Algebraic Data Types`

- More accurately, `sum types`

- (The other kind are `product types`, we'll come to those...)

## Option

- `Option A` is a `sum type` because it's _cardinality_ is

- the sum of `whatever the cardinality of A is` and `1`

- So `A` + `1`, kinda.

- (The `1` is to represent `Nothing`)

- The type `Option<boolean>` could have values of either

- `Some(true)`

- `Some(false)`

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

- (And I'm not writing a thinkpiece named **Javascript Objects Considered Harmful** or anything)

- (yet)

## Anyway

- Whilst `sum types` describe `this` _OR_ `that`.

- `Product types` describe `this` _AND_ `that`.

- So, a `Person` interface is just a nice way of carrying around a `string` _AND_ a `number`

## Tuple

- A good example of how these things are actually very similar is `Tuple`.

- A very simple simple product type is `Tuple A B`

- We could represent it like this:

```typescript
type Tuple<A, B> = { type: 'Tuple'; a: A; b: B }
```

- It is the _dual_ of `Either`...

- `Either<A,B>` is `A` _+_ `B`.

- `Tuple<A,B>` is `A` _x_ `B`.

- A `Tuple<string,number>` could represent `Person` interface from before as
  it's their `name` _AND_ `age`.

- Whilst `Either<string,number>` could be used to describe a person's `name` _OR_
  `age`.

- (I'm not sure why you would do this, admittedly)

- So, knowing that the _cardinality_ of `Either<TrafficLights, boolean>` is `5`

- What is _cardinality_ of `Tuple<TrafficLights, Boolean>`...?

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

- Will this **REALLY** always be there?

- Or can I make it a `sum` instead?

## Extra task time

- Given a constructor for making `Tuple` types:

```typescript
const tuple = <A, B>(a: A, b: B): Tuple<A, B> => ({
  type: 'Tuple',
  a,
  b,
})

tuple('Horse', 100)
// { type: "Tuple", a: "Horse", b: 100 })
```

- ...can we implement some of the functions we made for `Either` for `Tuple`?

- `map :: (B -> D) -> Tuple A B -> Tuple A D`

- `leftMap :: (A -> C) -> Tuple A B -> Tuple C B`

- `bimap :: (A -> C) -> (B -> D) -> Tuple A B -> Tuple B D`

- `match :: (A -> B -> C) -> Tuple A B -> C`

- Why is implementing `join` or `bind` difficult?
