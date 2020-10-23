# Part 4

## Effects and things happening

So far we've looked at a couple of things:

- `Maybe` and `Either` which are both __functors__ and __monads__

- They've helped us express _stuff that goes wrong_, as life does

- Lots of different __monoids__ for `strings` and things

- These have helped us formalise the _smashing together of data_

## Recap: 

All of the abstractions we've looked at so far have a few things in common:

- They are `pure` 

- They are `synchronous`

- But surely you must find yourself asking...

- __"That's all great, but where is the business value hiding?"__

## Bombshell:

- Today we're going to hold onto `purity` like our life depends on it

- ...but throw `synchronous` out of the window and straight through the sunroof of some
  idiot's passing sportscar

## But first, as ever... 

...a meandering distraction.

So far, we've not been concerned about time. Pure functions are handy like
that. They simplify down like maths equations.

- `a = (6 * 3) + (4 + 2)`

- `a = 18 + (4 + 2)`

- `a = 18 + 6`

- `a = 24`

- __OK__

## The same but with functions

If we look at the above as a bunch of functions though, it's more apparent
there is some sort of ordering to how things are calculated.

`a = add(multiply(6,3), add(4, 2))`

- The outer `add` function adds numbers, not functions, therefore, it can't do
  anything.

- But `multiply` deals with numbers, and it has those, so let's do that:

`a = add(18, add(4,2))`

- We still can't add `18` to a function, but we can calculate the inner `add`:

`a = add(18, 6)`

- And now the outer function is ready to go brrrrrrrrrrr:

`a = 24`

## OK

Let's look at the functions we've been using a lot of recently:

```haskell
map :: (A -> B) -> Maybe A -> Maybe B
```
- (brief recap)

```typescript
const map = <A,B>(f: (a: A) => B, a: Maybe<A>): Maybe<B> 
  => a.type === 'Just' ? just(f(a.value)) : nothing()
```

- Ordering doesn't really matter here, all the values are ready to go

## What about?

Let's imagine a fictional type `Async<A>`.

- Think of it like a `Promise<A>`, ie __something that will give me an A at
  some point__

- How does `map` work ordering wise there?
```haskell
map :: (A -> B) -> Async A -> Async B
```

- What's going to happen, roughly, step by step?

- .

- ..

- ...

## OK, now onto our friend Bind

What about `bind`?

```haskell
bind :: (A -> Async B) -> Async A -> Async B`
```

- What's going to happen? How long is it going to take?

- .

- ..

- ...

## What if there was a third way?

Meet our new buddy `ap`. Conceptually, he lives somewhere between `map` and `bind`.

- He works on a bunch of our old friends:

```haskell
ap :: Maybe (A -> B) -> Maybe A -> Maybe B
```

```haskell
ap :: Either E (A -> B) -> Either E A -> Either E B
```
 
- He can be quite helpful there, but not particularly interesting.

- However...

- Today though, we'll look at him with our new `Async` friend:

## Let's think about what's going to need to happen here:

```haskell
ap :: Async (A -> B) -> Async A -> Async B
```

- We __wait__ for an `A -> B` function from our first `Async`

- We also __wait__ for an `A` value from our second one.

- Then we smash them together.

- What's different and useful about this?

- What if each of our `Async`s were doing long slow API calls?

## Continuation

Today we're going to build a thing called `Continuation` (in some places it's
called `Cont`)

It's better than a __callback__, worse than a __Promise__.

We can improve him in future though.
