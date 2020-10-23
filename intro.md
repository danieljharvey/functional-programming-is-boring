---
title: Functional programming is boring
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

## Hello.

## Functional programming is exciting

## Functional programming is **boring**

## Functional programming is difficult

## **Imperative** programming is difficult

## Functional programming is **tediously predictable**

## What's the big idea then?

- Immutability 

- __(as much as possible)__

- Purity

- __(as much as possible)__

- Composability

- __(making lots of small good things and combining them instead of big things)__

## Sounds familiar....

That's because React has been slowly smuggling FP ideas into the mainstream for
years

- pure functions (like, you know, render)

- separating effects from pure code (hooks)

- state machines and stuff (redux, xstate, blah)

## Basically none of this should be wildly different

So pretty boring, basically.

## I hear FP is about maths

So, yes, and no.

- There is a lot of cross over between formal maths and the more academic corners of functional
  programming.

- Dependently-typed programming languages like Idris or Agda can be used as
  mathematical proof solvers

- We can enjoy all the great bits without caring about any of that if we don't
  want to. 

## Exercise one

Spot the pure function:

```typescript
let horses = []

const goodHorseNames = ['SNOWBALL','NAPOLEON','SPIRIT']

const functionOne = (name: string) => {
  if (goodHorseNames.contains(name)) {
    horses.push(name)
  }
}

const functionTwo = (horses: string[], name: string) => {
  if (goodHorseNames.contains(name)) {
    return [...horses, name]
  }
  return horses
}

const functionThree = (name: string) => {
  console.log(`checking for ${name}`)
  return (goodHorseNames.contains(name))
}
```


## What did you choose?

## Well?

## If you chose function **ONE**

- Then bad news

```typescript
const functionOne = (name: string) => {
  if (goodHorseNames.contains(name)) {
    horses.push(name) // bad function
  }
}
```

Mutating an external variable is a side effect and __NOT PURE__

# If you chose function **TWO**

- Then great job

```typescript
const functionTwo = (horses: string[], name: string) => {
  if (goodHorseNames.contains(name)) {
    return [...horses, name]
  }
  return horses
}
```

Although this uses an external var, `goodHorseNames`, it doesn't mess with it,
so it's a ~~totally sick and good function~~.

- (Although somebody else could still mutate `goodHorseNames` externally and we'd lose referential transparency, but we're doing our best here, it's Javascript ffs)

## If you chose function **THREE**

- Then kinda OK job

```typescript
const functionThree = (name: string) => {
  console.log(`checking for ${name}`) // badness
  return (goodHorseNames.contains(name))
}
```

Although it doesn't mess with any variables or do anything seriously bad,
logging is still a side effect. You think you don't care now until it makes
your test output look like messy garbage.

## OK, I am a functional programming expert now

Now hang on.

There is one more thing that divides the FP community bitterly.

## TYPES

- Are they __totally sick__?

- Or are they just ~~slowing down my 10x-ing~~?

## SUBTEXT: I THINK THEY ARE TOTALLY SICK AND IMPORTANT

- If you are happy gluing lots of small

- and sometimes rather abstract bits of code together

- without a compiler to tell you whether you're messing it up

- then you are braver than I.

## They also give a nice language to talk about things

- What does this function do?

```typescript
const urgh = (key: string, items: Record<string, number>): number | undefined => {
  // ...? 
}
```

- Or better still, what's the only sane thing that this function could possibly do?

```typescript
const blah = <A>(a: A): A => {
  // ...?
}
```

- Or this one?

```typescript
const bleugh = <A,B>(a: A, b: B): A => {
   // ...?
}
```

## A notation for types

When talking about the type signatures of functions, we can use `Hindley-Milner` notation.

```haskell
urgh :: String -> Record<string, number> -> (number | undefined)
```

```haskell
blah :: A -> A
```

```haskell
bleugh :: A -> B -> A
```

We won't always do this, but sometimes it's less noisy than a `Typescript`
functional signature.

- The docs for `Ramda` have a [great guide](https://github.com/ramda/ramda/wiki/Type-Signatures) for these type signatures.

## And now...onwards....
