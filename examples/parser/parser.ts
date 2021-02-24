import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { flow, pipe } from 'fp-ts/function'

// internal state type
type ParserState<A> = {
  remaining: string
  value: A
}

// our errors can be of two types - string ones to make nice
// default built-in errors, or the user can use their own type
type ParserError<E> =
  | { type: 'ParserError'; text: string }
  | { type: 'CustomError'; value: E }

export const parserError = (text: string): ParserError<never> => ({
  type: 'ParserError',
  text,
})

export const customError = <E>(value: E): ParserError<E> => ({
  type: 'CustomError',
  value,
})

// this is a type for a Parser. The `A` generic shows the type that it will
// return if it succeeds
export type Parser<E, A> = {
  type: 'Parser'
  parse: (input: string) => E.Either<ParserError<E>, ParserState<A>>
}

// a constructor function for buiiding a Parser from it's function and wrapping
// it in a discriminated union to make TS happy
export const makeParser = <E, A>(
  parse: (input: string) => E.Either<ParserError<E>, ParserState<A>>
): Parser<E, A> => ({
  type: 'Parser',
  parse,
})

// given a Parser and a string, run it, returning a value if it works
export const runParser = <E, A>(
  parser: Parser<E, A>,
  input: string
): E.Either<ParserError<E>, A> =>
  pipe(
    parser.parse(input),
    E.chain(state =>
      state.remaining.length == 0
        ? E.right(state.value)
        : E.left(
            parserError(
              `Expected all of input to be used up, however "${state.remaining}" has not been consumed`
            )
          )
    )
  )

// a Parser that always fails with the given message
export const fail = (text: string): Parser<never, never> =>
  makeParser(_ => E.left(parserError(text)))

// a Parser that always fails with the given custom value
export const failCustom = <E>(value: E): Parser<E, never> =>
  makeParser(_ => E.left(customError(value)))

// helper function that takes the first X characters of string, returning null
// if X is over string length
const splitString = (
  input: string,
  length: number
): [string, E.Either<ParserError<never>, string>] => {
  const match = input.slice(0, length)
  const actualMatch =
    match.length >= length
      ? E.right(match)
      : E.left(
          parserError(
            `Tried to parse the next ${length} chars but only ${input.length} characters available.`
          )
        )
  const rest = input.slice(length)
  return [rest, actualMatch]
}

// map the item we've parsed into something else
export const map = <A, B>(f: (a: A) => B) => <E>(
  parser: Parser<E, A>
): Parser<E, B> =>
  makeParser(
    flow(
      parser.parse,
      E.map(state => ({ ...state, value: f(state.value) }))
    )
  )

// try parser1 then parser2
export const alt = <E, A>(parser2: Parser<E, A>) => (
  parser1: Parser<E, A>
): Parser<E, A> =>
  makeParser(input => {
    const resultA = parser1.parse(input)
    if (E.isRight(resultA)) {
      return resultA
    }
    return parser2.parse(input)
  })

// provide a list of alternatives that will be tried in order
export const altMany = <E, A>(
  parser1: Parser<E, A>,
  ...parsers: Parser<E, A>[]
): Parser<E, A> =>
  parsers.reduce((total, parser) => alt<E, A>(total)(parser), parser1)

// try parserA, and if succeeds, pass the result to thenParserB
export const andThen = <E, A, B>(
  thenParserB: (a: A) => Parser<E, B>
) => (parserA: Parser<E, A>): Parser<E, B> =>
  makeParser(
    flow(
      parserA.parse,
      E.chain(state =>
        thenParserB(state.value).parse(state.remaining)
      )
    )
  )

// take two parsers, and return a parser that parses two things in sequence
// and puts them in a tuple
export const pair = <E, A, B>(
  parserA: Parser<E, A>,
  parserB: Parser<E, B>
): Parser<E, [A, B]> =>
  makeParser(input => {
    const resultA = parserA.parse(input)
    if (E.isLeft(resultA)) {
      return resultA
    }
    const resultB = parserB.parse(resultA.right.remaining)
    if (E.isLeft(resultB)) {
      return resultB
    }
    return E.right({
      ...resultB.right,
      value: [resultA.right.value, resultB.right.value],
    })
  })

// parse two things, then discard the second one
export const left = <E, A, B>(
  parserA: Parser<E, A>,
  parserB: Parser<E, B>
): Parser<E, A> =>
  pipe(
    pair(parserA, parserB),
    map(([a, _]) => a)
  )

// parse two things, then discard the first one
export const right = <E, A, B>(
  parserA: Parser<E, A>,
  parserB: Parser<E, B>
): Parser<E, B> =>
  pipe(
    pair(parserA, parserB),
    map(([_, b]) => b)
  )

// given a parser, return an array with one or more matches
export const oneOrMore = <E, A>(
  parserA: Parser<E, A>
): Parser<E, A[]> =>
  makeParser(input => {
    const res = parserA.parse(input)
    if (E.isLeft(res)) {
      return res
    }
    const { remaining, value } = res.right
    let values = [value]
    let next = remaining
    while (true) {
      const parsed = parserA.parse(next)
      if (E.isRight(parsed)) {
        next = parsed.right.remaining
        values.push(parsed.right.value)
      } else {
        break
      }
    }
    return E.right({ remaining: next, value: values })
  })

// given a parser, return an array with zero or more matches
export const zeroOrMore = <E, A>(
  parserA: Parser<E, A>
): Parser<E, A[]> =>
  makeParser(input => {
    let next = input
    let values = []
    while (true) {
      const parsed = parserA.parse(next)
      if (E.isRight(parsed)) {
        next = parsed.right.remaining
        values.push(parsed.right.value)
      } else {
        break
      }
    }
    return E.right({ remaining: next, value: values })
  })

// a parser that matches any character
export const anyChar = makeParser(input => {
  const [rest, optionMatch] = splitString(input, 1)
  return pipe(
    optionMatch,
    E.map(match => ({ remaining: rest, value: match }))
  )
})

// given a parser, and a predicate, return a new, fussier parser
export const pred = <E, A>(
  parser: Parser<E, A>,
  predicate: (a: A) => boolean
): Parser<E, A> =>
  makeParser(
    flow(
      parser.parse,
      E.chain(state =>
        predicate(state.value)
          ? E.right(state)
          : E.left(
              parserError(
                `Value ${state.value} did not satisfy predicate`
              )
            )
      )
    )
  )

// parser that matches 'lit' exactly or fails
export const matchLiteral = <Lit extends string>(
  lit: Lit
): Parser<never, Lit> =>
  makeParser(input => {
    // grab the next `X` chars
    const [rest, optionMatch] = splitString(input, lit.length)
    return pipe(
      optionMatch,
      // if we have a match, and it's what we expect, the Parser succeeds
      E.chain(match =>
        match === lit
          ? E.right({ remaining: rest, value: lit })
          : E.left(
              parserError(
                `Could not match literal, expected ${lit} but got ${match}`
              )
            )
      )
    )
  })

// predicate that checks whether a given char is numeric
const isNumber = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (
    code > 47 && code < 58 // numeric (0-9)
  )
}

// predicate that checks whether a given char is a letter
const isLetter = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (
    (code > 64 && code < 91) || // upper alpha (A-Z)
    (code > 96 && code < 123) // lower alpha (a-z)
  )
}

// predicate that checks whether a given char is a letter or a number
const isAlphaNumeric = (char: string): boolean =>
  isLetter(char) || isNumber(char)

// parse a single alphanumeric char
export const alphaNumeric = pred(anyChar, isAlphaNumeric)

// parse a single digit
export const numParser: Parser<never, number> = pipe(
  pred(anyChar, isNumber),
  map(a => Number(a))
)

// parse a string of alphanumeric chars
export const identifier = pipe(
  oneOrMore(alphaNumeric),
  map(as => as.join(''))
)

// parses a single piece of whitespace
export const whitespace = pred(anyChar, a => a.trim() === '')

// parser that consumes zero or more items of whitespace
export const space0 = zeroOrMore(whitespace)

// parser that consumes one or more items of whitespace
export const space1 = oneOrMore(whitespace)

// a Parser that looks for `match`, and if it finds it, returns `A`
export const mapLiteral = <A>(
  match: string,
  output: A
): Parser<never, A> =>
  pipe(
    matchLiteral(match),
    map(_ => output)
  )

type Op = { type: 'Add' } | { type: 'Subtract' }

type Expr =
  | { type: 'Int'; value: number }
  | { type: 'Op'; op: Op; value1: Expr; value2: Expr }

const parseOp = altMany<never, Op>(
  mapLiteral('+', { type: 'Add' }),
  mapLiteral('-', { type: 'Subtract' })
)

const intParser: Parser<never, Expr> = pipe(
  numParser,
  map(a => ({ type: 'Int', value: a }))
)

const parseOpExpr: Parser<never, Expr> = pipe(
  pair(
    pair(right(matchLiteral('('), intParser), parseOp),
    left(intParser, matchLiteral(')'))
  ),
  map(([[a, op], b]) => ({ type: 'Op', op, value1: a, value2: b }))
)

const parseExpr: Parser<never, Expr> = altMany(intParser, parseOpExpr)

console.log(runParser(parseExpr, '1'))
console.log(runParser(parseExpr, '(1+1)'))
console.log(runParser(parseExpr, '(1 + 1)')) // we haven't accounted for whitespace
