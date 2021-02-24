# Lesson 6

## Validation

Previously we've looked at `TaskEither`, which combines the power of a `Task` and
an `Either`.

- Today we're going to look at starting to use these things in a **REAL LIFE**
  situation, creating a basic API endpoint for fetching pictures of dogs.

## A quick catch up

You might remember our `Either` type looks something like this:

```typescript
type Either<E, A> =
  | { type: 'Left'; value: E }
  | { type: 'Right'; value: A }
```

- Which means in `fp-ts` land we can create them like this:

```typescript
import * as E from 'fp-ts/Either'

const err: Either<string, never> = E.left('something went wrong')

const yeah: Either<never, number> = E.right(100000000)
```

- `TaskEither` works very similarly indeed.

```typescript
import * as TE from 'fp-ts/TaskEither'

const err: TaskEither<string, never> = TE.left('something went wrong')

const yeah: TaskEither<never, number> = TE.right(100000000)
```

- They are so similar in fact that we can `lift` an `Either` to a `TaskEither`.

```typescript
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'

const successEither: Either<never, string> = E.right('YESSS!')

const successTaskEither: TaskEither<never, string> = TE.fromEither(
  successEither
)
```

- `Either` is synchronous, and `TaskEither` is async, so this just makes a
  `TaskEither` that immediately resolves to the value in the `Either`.

- Much the way `Promise.resolve(1)` creates a `Promise` that immediately
  resolves with a value of `1` inside.

## Back to validation

So, today we're going to be cracking open a validation library called `io-ts`,
made by the good people that brought us `fp-ts`.

- It is very similar to `Joi` or `Yup`, with two delicious extras:

- We can get Typescript types from our validators for free:

```typescript
import * as t from 'io-ts'

const apiRequest = t.type({
  name: t.string(),
  age: t.number(),
})

type ApiRequest = t.TypeOf<typeof apiRequest>
// is equal to
// type ApiRequest = { name: string, age: number }
```

- When it validates, it returns our old friend `Either`

```typescript
import * as t from 'io-ts'

const goodResult: Either<t.Errors, ApiRequest> = apiRequest.decode({
  name: 'horse',
  age: 100,
})

// goodResult == { type: "Right", right: { name: "horse", age: 100 }}

const badResult: Either<t.Errors, ApiRequest> = apiRequest.decode({
  wrong_name: 'horse',
  age_wrong_wrong: 'dog',
})

// badResult == { type: "Left", left: { ... error data from io-ts... }}
```

## Functional endpoint design

API endpoints are a really nice fit for FP, as we can think about them in
types. Let's define a type for an API response:

```typescript
type Response<Body, Status extends number> = {
  status: Status
  body: Body
}
```

- What would our endpoint types look like?

## A simple example

A `health` endpoint has no inputs

- It always returns a `200` status code along with a message like `Ok`.

- Therefore we can think of it as
```haskell
healthzAPI :: Response<'Ok', 200>
```

## What about something more complex?

How about an endpoint that returns the status of a given feature flag?

- It takes a `String`, which may or may not be one of the features flags.

- If it is, we'll return `Response<boolean, 200>`

- If we've never heard of that feature flag, we'll return `Response<string, 400>`

- Therefore we could think about the endpoint as
```haskell
featureFlagAPI :: String -> Either<Response<string, 400>, Response<boolean, 200>
```

- (there are probably strictly more appropriate HTTP status codes to use)

## And what about an endpoint that "does" something?

Most of our endpoints are going to do something asynchronous, be it other API
calls or database interactions.

- They probably take in a number of parameters too

- And it's pretty likely something might fail.

- Therefore we might have a more complex error types:
```haskell
type UserError = Response<string, 400>
type InternalError = Response<string, 500>
type APIError = UserError | InternalError
```

- Also, since we don't trust our inputs, they become `unknown`

- (They will gain proper types once they have been validated)

- As we're generalising, let's say our response has type `APIResponse`

- And therefore we're going to want something that looks like:
```haskell
niceAPI :: unknown -> TaskEither<APIError, APIResponse>
```

- Note that hopefully won't be written in one giant `pipe`, and instead built
  up out of smaller, sensibly-named functions like you would do in any other application

## Talk is cheap 

Therefore, we can use these tools to bring everything together and made a
handler for an API endpoint. Ours is going to:

- Validate the post data to check it is valid

- Fetch the URL of a picture of a dog from `dog.ceo`

- Create a happy birthday message

- Combine the message and the picture and return it to the user

- We're going to be using `pipe` for this:

```typescript
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'

const result = pipe(
  1,
  TE.right,
  TE.map(a => a + 1),
  TE.map(a => a + 1)
)
```

- And our outcome is going to look something like this:

```typescript
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'

const endpoint = (
  postData: unknown
): TE.TaskEither<ApiError, ApiResponse> =>
  pipe(
    // start with unknown data
    postData,

    // validate it
    TE.fromEither(validateApiRequest.decode(postData)),

    // fetch pictures and do things
    TE.chainW(request => {
      // fetch dog picture
      // make birthday message
    }),

    // combine everything
    TE.map(([picture, message]) => {
      // combine to make ApiResponse
    })
  )
```

## Let's do it!

Onwards!
