import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Apply'
import axios, { AxiosResponse } from 'axios'

// API TYPES
// These are defined using io-ts
// which is like Joi or Yup but also lets us derive a type
// for the output of the validator...
const breed = t.union([
  t.literal('pug'),
  t.literal('shiba'),
  t.literal('spanish'),
])

// ...like this
type Breed = t.TypeOf<typeof breed>

// post data in our requests
const apiRequest = t.type({
  breed,
  name: t.string,
  age: t.number,
})

type ApiRequest = t.TypeOf<typeof apiRequest>

// response type we will be returning
const apiResponse = t.type({
  message: t.string,
  url: t.string,
})

type ApiResponse = t.TypeOf<typeof apiResponse>

// validator for data we will be receiving from the external API
const dogApiResponse = t.type({
  message: t.string,
  status: t.literal('success'),
})

// ERROR TYPE
// all of the different things that can go wrong in our API, defined below:
type ApiError =
  | AgeTooLow
  | NameIsEmpty
  | RequestValidationFailure
  | DogApiValidationFailure
  | AxiosFetchError

type AgeTooLow = { type: 'AgeTooLow' }

type NameIsEmpty = { type: 'NameIsEmpty' }

type AxiosFetchError = { type: 'AxiosFetchError' }

type DogApiValidationFailure = {
  type: 'ApiValidationFailure'
  errors: t.Errors
}

type RequestValidationFailure = {
  type: 'RequestValidationFailure'
  errors: t.Errors
}

// constructor functions for our errors
const ageTooLow = (): AgeTooLow => ({ type: 'AgeTooLow' })

const nameIsEmpty = (): NameIsEmpty => ({ type: 'NameIsEmpty' })

const axiosFetchError = (): AxiosFetchError => ({
  type: 'AxiosFetchError',
})

const dogApiValidationFailure = (
  errors: t.Errors
): DogApiValidationFailure => ({
  type: 'ApiValidationFailure',
  errors,
})

const requestValidationFailure = (
  errors: t.Errors
): RequestValidationFailure => ({
  type: 'RequestValidationFailure',
  errors,
})

// COMBINATORS
// These functions will be helpful in making our API more resilient

// retry a given task `te` X times on failure
const withRetries = <E, A>(
  te: TE.TaskEither<E, A>,
  retries: number
): TE.TaskEither<E, A> =>
  pipe(
    te,
    TE.orElse(err =>
      retries > 0 ? withRetries(te, retries - 1) : TE.left(err)
    )
  )

// validate input using the provided io-ts `validator`
const withIoTs = <E, A>(
  validator: t.Type<A>,
  toError: (e: t.Errors) => E
) => (postData: unknown): TE.TaskEither<E, A> =>
  TE.fromEither(
    pipe(
      validator.decode(postData),
      E.orElse(err => E.left(toError(err)))
    )
  )

// used to simulate failure
// `probability` is between 0 and 1 that task fails
// `te` is a TaskEither that you wish to fail sometimes
// `err` is the error you wish it to fail with
export const sometimesExplode = <E, A>(
  probability: number,
  te: TE.TaskEither<E, A>,
  err: E
): TE.TaskEither<E, A> => {
  const rand = Math.random()
  return rand < probability ? TE.left(err) : te
}

// FUNCTIONS

// get url for Dog fetch
const getBreedUrl = (breed: Breed): string =>
  `https://dog.ceo/api/breed/${breed}/images/random`

// Axios.get wrapped in a TaskEither
const axiosGet = (
  url: string
): TE.TaskEither<AxiosFetchError, AxiosResponse<unknown>> =>
  TE.tryCatch(
    () => axios.get(url),
    _ => axiosFetchError()
  )

// fetch dog from API (retrying 5 times)
// unwrap AxiosResponse
// validate response using io-ts
// return `message` from the payload
export const getDogWithValidation = (
  breed: Breed
): TE.TaskEither<ApiError, string> => undefined as any

// if the name and age are valid, then construct a nice birthday message
const makeBirthdayMessage = (
  req: ApiRequest
): E.Either<AgeTooLow | NameIsEmpty, string> => {
  if (req.age < 1) {
    return E.left(ageTooLow())
  }
  if (req.name.length < 1) {
    return E.left(nameIsEmpty())
  }
  const message = `Happy Birthday ${req.name}, ${req.age} years old today!`
  return E.right(message)
}

// pass multiple TaskEithers to run them in parallel and return
// a tuple of results
const parallel = A.sequenceT(TE.taskEither)

// the whole endpoint should do the following
// validate the input with the `apiRequest` validator
// take the output and then...
// a) fetch a dog with `getDogWithValidation`
// b) try to make a birthday message
// then combine those to create an `apiResponse`
export const endpoint = (
  postData: unknown
): TE.TaskEither<ApiError, ApiResponse> => undefined as any
