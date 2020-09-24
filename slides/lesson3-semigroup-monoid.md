---
title: Lesson 3 - Semigroup / Monoid 
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

# Part 3

## Smashing things together, generally 

In the last two things we looked at, `Maybe` and `Either`, there was one key
theme:

- When we did stuff like:

```typescript
const maybeBigNumber = Maybe.map(x => x * 2, maybeSmallNumber)
```

- We separated _what_ we want to do with the data inside

- (ie, double it)

- From _how_ we're going to do that

- (check whether there's any data there first, and only run the function if
  there is)

## This certainly isn't a new idea 

- Compare:

```typescript
const numbers = [1,2,3,4,5]

const doubleNumbers = () => {
  let newNumbers = []
  for (var i = 0; i < numbers.length; i++) {
    const newNumber = numbers[i] * 2
    newNumbers.push(newNumber)
  }
  return newNumbers
}
```

- With:

```typescript
const newNumbers = [1,2,3,4,5].map(i => i * 2)
```

- In the first example _how_ and _what_ are all jumbled up.

- But in the second, the `map` function on `array` has taken care of _how_.

- So we just need to provide _what_ we want to do with the data inside.

## Today we're going to split something else in a similar way

Let's say we have a list of `string` values.

```typescript
const list = ["Dog", "Log", "Hog", "Bog", "Egg"]
```

- For some reason, we want to squash these together into one cursed string.

- OK, well actually, we want to combine any `array` of `string` values together

- How could we do it?

- .

- ..

- ...

## We could use reduce

Often `reduce` is a go to tool for this.

```typescript
const conflattenate = (strs: string): string => 
  strs.reduce((total, str) => `${total}${str}`,"")
```

- Seems fine

```typescript
console.log(conflattenate(list))
// "DogLogHogBogEgg"
```

And although this is reasonably elegant, we've still mixed up the _what_ and
the _how_ a bit.

- What if we could split out the interesting parts?

- What are the interesting parts here?

## Smashing things together

- The most interesting part is probably the combination of two things

- Let's call this `append`

- So our function will be `append :: A -> A -> A`

- (So, here, `append :: String -> String -> String`)

- What would that function look like?

- Hopefully, something like:
```typescript
const append = (a: string, b: string): string => `${a}${b}`
```

## Nothing to smash

- The other interesting part is what we start with

- `reduce` always takes an empty value

- That value would be `empty :: A`

- (or `empty :: String` in this example)

- What does thing look like?

- Hopefully:
```typescript
const empty = ""
```

- What happens when we `append` a `String` with an empty `String`?

- Nothing!

- That's because the `empty` value is an `identity` value - ie, it does
  nothing when `append`-ed to another value. 

## Putting it together

This abstraction is called `Monoid`.

- You might remember the term from it's hit single:

- __A MONAD IS A MONOID IN THE CATEGORY OF ENDOFUNCTORS__

- It's not very clever, just two functions in a record 
```typescript
type Monoid<A> = {
  append: (one: A, two: A) => A,
  empty: A
}
```

- We can write one for `String`:

```typescript
const monoidString: Monoid<string> => {
  append: (one, two) => `${one}${two}`,
  empty: ""
}
```

- And then create a function that uses it on an array of strings:

```typescript
const concat = (monoid: A, list: A[]): A => 
  list.reduce(monoid.append, monoid.empty)
```

- It works!
```typescript
console.log(concat(monoidString,["Dog","Log","Hog","Bog","Egg"]))
// "DogLogHogBogEgg"
```

- And also, the empty version works...

```typescript
console.log(concat(monoidString,[]))
// ""
```

## Monoid is so stupid it doesn't even seem like a thing

I assure you, that this is a feature, not a bug.

- Half of the computing stuff you do is just smashing these bad boys together

- The binary _AND_ operation: `True && False`

- Or indeed, _OR_: `False || True` 

- Array concatenation: `[1,2,3,4].concat([5,6,5])`

- Addition: `1 + 100`

- Multiplication: `10 * 20`

## WHOA

- It is said that arguing with idiots is impossible because they bring you down
to their level, and then _beat you with experience_.

- By reducing all our problems into smaller more stupid problems, we can do the
same.

- Let's give some of these a smash
