---
title: Lesson 4 - Reader 
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

# Part 5

## Global variables

In our quest to make our functions small and composable, you may notice a lack
of an old friend:

- __Global State__

- No great loss, perhaps.

- (There will be always be casualties in war, particularly dogmatic ones)

- However, it does mean our function signatures can end up looking like this:
```typescript
const doThing = 
  ( logger: Logger, 
    thingDoer: ApiObject,
    featureFlags: FeatureFlags, 
    userId: string, 
    isHorse: boolean) => {
  if (featureFlags.shouldDoThing) {
    logger('Doing thing')
    return thingDoer(userId, isHorse)
  }
  logger('Not doing thing')
  return false
}
```

## A fix

Now, if we're passing the same pile of things around and it's not too painful,
there are already perfectly good solutions:

- Bundle up the shared things into an object...
```typescript
type Environment = {
  logger: Logger
  thingDoes: ApiObject
  featureFlags: FeatureFlags
}
```

- And pass it around like this: 

```typescript
const doThing2 = 
  ( env: Environment
    userId: string, 
    isHorse: boolean) => {
  if (env.featureFlags.shouldDoThing) {
    env.logger('Doing thing')
    return env.thingDoer(userId, isHorse)
  }
  env.logger('Not doing thing')
  return false
}
```

## And sure...

- You can also destructure `env` etc, if that's your style.

```typescript
const doThing2 = 
  ({ featureFlags, thingDoer, logger}: Environment,
    userId: string, 
    isHorse: boolean) => {
  if (featureFlags.shouldDoThing) {
    logger('Doing thing')
    return thingDoer(userId, isHorse)
  }
  logger('Not doing thing')
  return false
}
```

- If that solves your problem...

- __STOP NOW!__

- However, if you are baying for the sweet taste of abstraction, read on...

## Our new friend Reader

Now, the problem `Reader` helps us solve is drilling this shared object 9
functions deep.

- Imagine our `thingDoer` from earlier also needed the `env`:

```typescript
const doThing2 = 
  ( env: Environment,
    userId: string, 
    isHorse: boolean) => {
  const { featureFlags, thingDoer, logger } = env
  if (featureFlags.shouldDoThing) {
    logger('Doing thing')
    return thingDoer(env, userId, isHorse)
  }
  logger('Not doing thing')
  return false
}
```

- And `thingDoer` used it for something else...

- And that dependency needed it for something else...

- And they tell their friends....

- And they tell their friends......

## We're talking about...

Essentially it lets us established a shared _context_. 

- And if your mind leaps to `React Context`...

- Then yes, actually, this is right on the money

- `Reader` solves the same problems

- (and arguably, this is probably where `React` got the idea, `Jordan Walke` being an avid
  FPer)

## Show me the code!

You asked for it:

```typescript
type Reader<R,A> = { type: "Reader", runReader: (r: R) => A }
```

- It's called `Reader` because it lets us _read_ from the _environment_

- The _environment_ is whatever we decide `R` is.

- Ooooohhhhh kaaaaayyyyyyyy....? 

- Perhaps an example...?

- First a helpers for making a `Reader` value: 
```typescript
const reader = <R,A>(runReader: (r: R) => A): Reader<R,A> => ({
  type: "Reader", runReader
})
```

## So

Let's say our _environment_ is a `string` with the _secret password_ inside.

- We can make a password checker function:

```typescript
const secretPasswordChecker = 
  (userGuess: string): Reader<string,boolean> => 
    reader(secretPassword => 
      userGuess === secretPassword)
```

- It won't do anything though.

- We need to _run_ it and pass the `environment` to get things moving:
```typescript
const secretPassword = "HORSES_ARE_GREAT100"

const tryLogin = (userGuess: string): boolean => 
  secretPasswordChecker(userGuess).runReader(secretPassword) 
```

- Let's see if it works.

- Oh no!
```typescript
tryLogin("HORSES_ARE_NOT_GREAT") // false
```

- (it did work, that doesn't stop it being a disappointing result though)

- Oh yes!
```typescript
tryLogin("HORSES_ARE_GREAT100") // true
```

## You won't be entirely surprised to hear... 

We can `map` and `bind` and even _monoidally combine_ our `Reader` values
before plopping the _environment_ in and getting the final outcome.

- This means we just get to deal with the interesting bits of code

- And then just chuck in all the config afterwards

- If you're thinking _"This Sounds Like The Kind Of Things That Would Make Testing Quite
  Straightforward"_...

- Then yes - this pattern is great for that, particularly passing in effectful
  stuff like `axios` at runtime, or a stub for tests. 

## More old friends

- Things like `map` work as you'd hopefully expect:
```haskell
map :: (A - B) -> Reader R A -> Reader R B
```

- We take the environment, run it on the last thing, and pass it on to the next

```typescript
const map = <R,A,B>(f: (a: A) => B, readA: Reader<R,A>)
  : Reader<R,A> => 
      reader(r => {
        const a = readA.runReader(r)
        return fn(a)
      }) 
```

## Map map map map mapping

- Now we can turn our `success` `boolean` and turn it into a nice `string`.

```typescript
const displayLoginMessage = (success: boolean): string => 
  success
   ? "You are so logged in right now" 
   : "You blew it, that's so incredibly wrong"
```

- Let's see it in action again:

```typescript
const secretPassword = "HORSES_ARE_GREAT100"

const tryLogin = (userGuess: string): string => 
  map(displayLoginMessage, secretPasswordChecker(userGuess))
    .runReader(secretPassword) 
```

- Oh no!

```typescript
tryLogin("HORSES_ARE_NOT_GREAT")
// "You blew it, that's so incredibly wrong"
```

- Oh yes!

```typescript
tryLogin("HORSES_ARE_GREAT100")
// "You are so logged in right now"
```

## Over to you

We have some functions to `Reader-ise`... 
