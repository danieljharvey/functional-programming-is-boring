## Lesson 8

Previously, we've looked at both `Either`, which allows us to return values
that either are success or failure:

```typescript
type Either<E,A> = { type: "Left",  value: E }
                 | { type: "Right", value: A }
```

We also looked at `Continuation`, which lets us chain callbacks in a nice
functional style:

```typescript
type Continuation<A> = {
  type: "Continuation";
  runContinuation: (next: (a: A) => void) => void;
};
```

- Now, if you remember back, we described `Continuation` as "`Promise`, but a
  bit worse".

- That's because it ignores the idea that anything can fail.

- So what does `Promise` do?

## The fail rail

Promise has a single type parameter `A`, that's the type that happens when
everything goes well.

- In what ways can a `Promise` fail?

- .

- ..

- ...

- ....

- .....

- I can think of two:
```typescript
Promise.reject("Oh no!")
```

- and:
```typescript
throw Error("Destroy the purity of this computation")
```

## What's the problem then?

The thing is, that we have no way of tracking the type of errors or failure in
`Promise` chains. When everything is going well, they and their procedural
cousins `async` and `await` are excellent ways to unclutter asynchronous code.

- The "success" rail, as such, is a happy and productive place.

- However, once we `throw` or `reject`, all bets are off.

- The value gets binned off down the "fail" rail, and gets mixed up with `out
  of memory` errors and any sort of other nonsense that can happen with
computers.

- Therefore, really `Promise` has a type of `Promise<any, A>`

- Can we do better?

## Typing the fail rail

So a thing about `Monads`, which are a thing we've been using, but not boasting
about it because we're not jerks, is that they can also be composed.

- We could have `ReaderMaybe<R,A>`, which provides a read only environment of
  type `R` and an `A` value, that may or may not exist.

- We could have an `EitherMaybe<E,A>`, which returns either a failure of type
  `E` or a success of type `A` (however the `A` might not be there).

- Hopefully it's clear that not all `Monad` combinations are born equal.

- However, we're going to talk about a totally winning team:

- `TaskEither<E,A>`

- Now, we haven't talked about `Task<A>`, but it's the same as
  `Continuation<A>`, in that it captures the idea of an async computation that
can't fail.

- (also, this is what it's called in `fp-ts`, which we'll be using today)

- Therefore `TaskEither<E,A>` is an asynchronous computation that can succeed
  with an `A` or fail with an `E`.

- We have a type for the failures.

- (they are also lazy rather than eager, so returning one from a function
  doesn't run it until you decide, mumble mumble referential transparency)

## How can we make one?

Good question. Let's crack open that library:
```typescript
import * as TE from "fp-ts/lib/TaskEither";
```

- Here's a successful one:
```typescript
const great = TE.right("success!")
```

- And here's a failure:
```typescript
const bad = TE.left("oh no!")
```

- So far, it's just like using an `Either`.

- Let's wrap up some __REAL WORLD__ code:

- Here we're wrapping up an API call made using `axios`:
```typescript
import axios, { AxiosResponse } from "axios";
import * as TE from "fp-ts/lib/TaskEither"

type ApiReturn = { code: number; description: string };

// businessValue :: TaskEither String (AxiosResponse ApiReturn) 
const businessValue = TE.tryCatch(
  () => axios.get("https://httpstat.us/200"),
  reason => new Error(`${reason}`)
);
```

- `tryCatch` takes two things:

1) A thunk that returns a `Promise` (this is important to stop things
  happening immediately)

2) An error handling function from `(e: any) => E` to tame any errors and put
  them in our error type.

- It returns a `TaskEither<E,A>`,  where we know what can go wrong.

- We can now use all our old friends `map` and `bind` (named `chain` in this
library, but completely equivalent) to do more things afterwards.

## Pipey pipey pipey

Let's talk about a new friend.

Our `businessValue` function returns either a `String` error or
`AxiosResponse<ApiReturn>`. Let's get rid of that `AxiosResponse` crap:

```typescript
// betterBusinessValue :: TaskEither String ApiReturn
const betterBusinessValue = pipe(
  businessValue,
  TE.map(resp => resp.data)
);
```

- Because all `fp-ts` functions are curried, what `pipe` is doing is taking the
  response from the first line (`businessValue`), and passing that to `TE.map`.
We can add more stuff to the `pipe` if we like, as so:

```typescript
// businessNumber :: TaskEither String Number
const businessNumber = pipe(
  businessValue,
  TE.map(resp => resp.data),
  TE.map(apiReturn => apiReturn.code)
)
```

- If you've used `ReasonML` or `Elixir`, it's very similar to the `|>` pipeline
  operator. 

## These are your tools, now go build

Let's use `TaskEither` to tame some terrible third party APIs and make the
world right again.
