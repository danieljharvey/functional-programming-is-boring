import axios, { AxiosResponse } from "axios";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";

// Tasks are useful for wrapping API calls
// they take a thunk that returns a Promise<A>
// and an error handler that takes any and returns E
// we get TaskEither<E,A>

// this is our API return type
type ApiReturn = { code: number; description: string };

// and here it is wrapped in a Promise
const axiosHttpStat: TE.TaskEither<
  Error,
  AxiosResponse<ApiReturn>
> = TE.tryCatch(
  () => axios.get("https://httpstat.us/200"),
  reason => new Error(`${reason}`)
);

export const first = axiosHttpStat;

///////////////////////////////////////////////////

// We'll want to unwrap the 'data' part of the AxiosResponse
// we can do this by mapping:

// pipe is a nice utility function from fp-ts
// the output of each item is passed as the input to the next one
// as fp-ts functions are all curried, the result is a list of
// commands, and we never really see the data
//
// point-free, see?

const axiosGetTask = pipe(
  axiosHttpStat,
  TE.map(resp => resp.data)
);

export const second = axiosGetTask;

///////////////////////////////////////////////////

// Having an error type of Error isn't wildly better than
// Promise, so let's start using a custom error type

type UserError = { type: "UserError"; statusCode: 400 };

const userError: UserError = { type: "UserError", statusCode: 400 };

type InternalError = { type: "InternalError"; statusCode: 500 };

const internalError: InternalError = {
  type: "InternalError",
  statusCode: 500
};

type MyError = UserError | InternalError;

// We can now use these to write an error handler to refine our TaskEither
// errorHandler :: any -> MyError
const errorHandler = (reason: any): MyError => {
  const msg = `${reason}`;
  return msg.includes("400") ? userError : internalError;
};

// axiosGetWithErrorHandler :: String -> TaskEither MyError ApiReturn
const axiosGetWithErrorHandler = (
  url: string
): TE.TaskEither<MyError, ApiReturn> => undefined as any;

export const third = axiosGetWithErrorHandler("https://httpstat.us/400");

///////////////////////////////////////////////////

// OK, let's deal with something a bit more Real World
// - a terrible external API that we hate

// here is the Promise returned by it
const badEndpoint = (): Promise<{ data: ApiReturn }> => {
  const prob = Math.floor(Math.random() * 100);
  if (prob < 5) {
    // genuine user error
    return axios.get("https://httpstat.us/400");
  }
  if (prob < 25) {
    // genuine success
    return axios.get("https://httpstat.us/200");
  }
  // the usual pain and sadness
  return axios.get("https://httpstat.us/500");
};

// First, let's wrap it in a TaskEither
// wrappedBadEndpoint :: TaskEither MyError ApiReturn
const wrappedBadEndpoint: TE.TaskEither<MyError, ApiReturn> = pipe(
  TE.tryCatch(() => badEndpoint(), errorHandler),
  TE.map(a => a.data)
);

// Now, let's take a look at the error. If it's an InternalError
// then we're going to want to retry, otherwise we should give up
// niceEndpoint :: TaskEither UserError ApiReturn
export const niceEndpoint: TE.TaskEither<
  UserError,
  ApiReturn
> = undefined as any;

export const fourth: TE.TaskEither<UserError, ApiReturn> = niceEndpoint;

///////////////////////////////////////////////////

// Really, this API might be genuinely broken, so we should probably limit how
// often we try to avoid going into an infinite loop
// Let's add a new error case:

type TooManyAttempts = { type: "TooManyAttempts" };

const tooManyAttempts: TooManyAttempts = { type: "TooManyAttempts" };

// now there are two types of error we can end up with
type NewError = UserError | TooManyAttempts;

// niceEndpointWithLimit :: Number -> TaskEither NewError ApiReturn
export const niceEndpointWithLimit = (
  attemptsLeft: number
): TE.TaskEither<NewError, ApiReturn> => undefined as any;

export const fifth: TE.TaskEither<NewError, ApiReturn> = niceEndpointWithLimit(
  4
);

///////////////////////////////////////////////////

// OK! Nice job! We are absolutely DDOS-ing the hell out of that endpoint with
// those retries though. Any chance we could crack open a bit of exponential
// back off?

// Here is a helper for delaying a TaskEither
// given a time in ms, and a TaskEither, run it after said delay
export const withDelay = <E, A>(
  delay: number,
  taskEither: TE.TaskEither<E, A>
): TE.TaskEither<E, A> =>
  pipe(
    TE.fromTask<E, unknown>(T.delay(delay)(T.of(true))),
    TE.chain(_ => taskEither)
  );

// niceEndpointWithBackoff :: (Number, Number) -> TaskEither NewError ApiReturn
export const niceEndpointWithBackoff = (
  attempts: number,
  delay: number
): TE.TaskEither<NewError, ApiReturn> => undefined as any;

export const sixth: TE.TaskEither<
  UserError | TooManyAttempts,
  ApiReturn
> = niceEndpointWithBackoff(5, 0);
