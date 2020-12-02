import * as t from 'io-ts'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Apply'
import axios, { AxiosResponse } from 'axios'

// API TYPES

const breed = t.union([
  t.literal('pug'),
  t.literal('shiba'),
  t.literal('spanish'),
])

type Breed = t.TypeOf<typeof breed>

const apiRequest = t.type({
  breed,
  name: t.string,
  age: t.number,
})

type ApiRequest = t.TypeOf<typeof apiRequest>

const apiResponse = t.type({
  message: t.string,
  url: t.string,
})

type ApiResponse = t.TypeOf<typeof apiResponse>

// Dog API return type
const dogApiResponse = t.type({
  message: t.string,
  status: t.literal('success'),
})

// ERROR TYPE

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

// retry a given task X times on failure
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

// validate input using io-ts
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
const getDogWithValidation = (
  breed: Breed
): TE.TaskEither<ApiError, string> =>
  pipe(
    withRetries(axiosGet(getBreedUrl(breed)), 5),
    TE.map(a => a.data),
    TE.chainW(withIoTs(dogApiResponse, dogApiValidationFailure)),
    TE.map(a => a.message)
  )

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

const parallel = A.sequenceT(TE.taskEither)

export const endpoint = (
  postData: unknown
): TE.TaskEither<ApiError, ApiResponse> =>
  pipe(
    postData,
    // validate postData
    withIoTs(apiRequest, requestValidationFailure),
    // take validate api request...
    TE.chainW(req =>
      parallel(
        // fetch dog from api
        getDogWithValidation(req.breed),
        // create birthday message
        TE.fromEither(makeBirthdayMessage(req))
      )
    ),
    // combine everything and return it
    TE.map(([url, message]) => ({ message, url }))
  )
