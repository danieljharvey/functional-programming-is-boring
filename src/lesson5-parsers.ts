import * as O from 'fp-ts/Option'
import { flow, pipe } from 'fp-ts/function'

// THE BASIC TYPES AND THINGS

// this is a type for a Parser. The `A` generic shows the type that it will
// return if it succeeds
export type Parser<A> = {
  type: 'Parser'
  parse: (input: string) => O.Option<[string, A]>
}

// a constructor function for buiiding a Parser from it's function and wrapping
// it in a discriminated union to make TS happy
export const makeParser = <A>(
  parse: (input: string) => O.Option<[string, A]>
): Parser<A> => ({
  type: 'Parser',
  parse,
})

// given a Parser and a string, run it, returning a value if it works
export const runParser = <A>(
  parser: Parser<A>,
  input: string
): O.Option<A> => {
  const result = parser.parse(input)
  if (O.isNone(result)) {
    return O.none
  }
  return result.value[0].length === 0
    ? O.some(result.value[1])
    : O.none
}

// helper function that takes the first X characters of string, returning null
// if X is over string length
const splitString = (
  input: string,
  length: number
): [string, O.Option<string>] => {
  const match = input.slice(0, length)
  const actualMatch = match.length >= length ? O.some(match) : O.none
  const rest = input.slice(length)
  return [rest, actualMatch]
}

// THE COMBINATORS

// map the item we've parsed into something else
export const map = <A, B>(
  parser: Parser<A>,
  f: (a: A) => B
): Parser<B> =>
  makeParser(
    flow(
      parser.parse,
      O.map(([rest, a]) => [rest, f(a)])
    )
  )

// try parser1 then parser2
export const alt = <A>(
  parser1: Parser<A>,
  parser2: Parser<A>
): Parser<A> =>
  makeParser(input => {
    const resultA = parser1.parse(input)
    if (O.isSome(resultA)) {
      return resultA
    }
    return parser2.parse(input)
  })

// provide a list of alternatives that will be tried in order
export const altMany = <A>(
  parser1: Parser<A>,
  ...parsers: Parser<A>[]
): Parser<A> =>
  parsers.reduce((total, parser) => alt(total, parser), parser1)

// try parserA, and if succeeds, pass the result to thenParserB
export const andThen = <A, B>(
  parserA: Parser<A>,
  thenParserB: (a: A) => Parser<B>
): Parser<B> =>
  makeParser(input => {
    const result = parserA.parse(input)
    if (O.isNone(result)) {
      return result
    }
    const [next, a] = result.value
    return thenParserB(a).parse(next)
  })

// take two parsers, and return a parser that parses two things in sequence
// and puts them in a tuple
export const pair = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<[A, B]> =>
  makeParser(input => {
    const resultA = parserA.parse(input)
    if (O.isNone(resultA)) {
      return resultA
    }
    const [rest, a] = resultA.value
    const resultB = parserB.parse(rest)
    if (O.isNone(resultB)) {
      return resultB
    }
    const [restB, b] = resultB.value

    return O.some([restB, [a, b]])
  })

// parse two things, then discard the second one
export const left = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<A> => map(pair(parserA, parserB), ([a, _]) => a)

// parse two things, then discard the first one
export const right = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<B> => map(pair(parserA, parserB), ([_, b]) => b)

// given a parser, return an array with one or more matches
export const oneOrMore = <A>(parserA: Parser<A>): Parser<A[]> =>
  makeParser(input => {
    const res = parserA.parse(input)
    if (O.isNone(res)) {
      return res
    }
    let [next, result] = res.value
    let results = [result]
    while (true) {
      const parsed = parserA.parse(next)
      if (O.isSome(parsed)) {
        next = parsed.value[0]
        results.push(parsed.value[1])
      } else {
        break
      }
    }
    return O.some([next, results])
  })

// given a parser, return an array with zero or more matches
export const zeroOrMore = <A>(parserA: Parser<A>): Parser<A[]> =>
  makeParser(input => {
    let next = input
    let results = []
    while (true) {
      const parsed = parserA.parse(next)
      if (O.isSome(parsed)) {
        next = parsed.value[0]
        results.push(parsed.value[1])
      } else {
        break
      }
    }
    return O.some([next, results])
  })

// given a parser, and a predicate, return a new, fussier parser
export const pred = <A>(
  parser: Parser<A>,
  predicate: (a: A) => boolean
): Parser<A> =>
  makeParser(input => {
    // run Parser
    const result = parser.parse(input)
    // if it fails, give up anyway
    if (O.isNone(result)) {
      return result
    }
    const [rest, a] = result.value
    // if the output value satisfies our predicate, it parses,
    // otherwise it fails
    return predicate(a) ? O.some([rest, a]) : O.none
  })

// USEFUL PREDICATES

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

// PARSERS

// a parser that matches any character
export const anyChar: Parser<string> = makeParser(input => {
  const [rest, optionMatch] = splitString(input, 1)
  return pipe(
    optionMatch,
    O.map(match => [rest, match])
  )
})

// parser that matches 'lit' exactly or fails
export const matchLiteral = <Lit extends string>(
  lit: Lit
): Parser<Lit> =>
  makeParser(input => {
    // grab the next `X` chars
    const [rest, optionMatch] = splitString(input, lit.length)
    return pipe(
      optionMatch,
      // if we have a match, and it's what we expect, the Parser succeeds
      O.chain(match => (match === lit ? O.some([rest, lit]) : O.none))
    )
  })

// parse a single alphanumeric char
export const alphaNumeric: Parser<string> = pred(
  anyChar,
  isAlphaNumeric
)

// parse a single digit (returning it as a string)
export const digit: Parser<string> = pred(anyChar, isNumber)

// parse a string of alphanumeric chars
export const identifier: Parser<string> = map(
  oneOrMore(alphaNumeric),
  as => as.join('')
)

// parses a single piece of whitespace
export const whitespace: Parser<string> = pred(
  anyChar,
  a => a.trim() === ''
)

// parser that consumes zero or more items of whitespace
export const space0: Parser<string[]> = zeroOrMore(whitespace)

// parser that consumes one or more items of whitespace
export const space1: Parser<string[]> = oneOrMore(whitespace)

// a Parser that looks for `match`, and if it finds it, returns `A`
export const mapLiteral = <A>(match: string, output: A): Parser<A> =>
  map(matchLiteral(match), _ => output)

// WARM UP EXERCISES
//
// one - parse any single character
export const one: Parser<string> = anyChar

// two - parse any numeric digit
export const two: Parser<string> = digit

// three - parse any numeric digit and turn it into a number
export const three: Parser<number> = map(digit, Number)

// four - parse any letter except H
export const four: Parser<string> = pred(
  anyChar,
  a => isLetter(a) && a !== 'h' && a !== 'H'
)

// five - parse a string of exclamation marks as an array of characters
export const five: Parser<string[]> = oneOrMore(
  pred(anyChar, a => a == '!')
)

// six - parse a string of exclamation marks as a string
export const six: Parser<string> = map(five, as => as.join(''))

// seven - parse a string of alphanumeric characters
export const seven: Parser<string> = identifier

// eight - parses two words separated by a space
export const eight: Parser<[string, string]> = pair(
  identifier,
  right(space1, identifier)
)

// nine - parses 'horse' and nothing else
export const nine: Parser<'horse'> = matchLiteral('horse')

// ten - parse one or more digits separated by commas
export const ten: Parser<number[]> = map(
  pair(three, zeroOrMore(right(matchLiteral(','), three))),
  ([a, as]) => [a, ...as]
)

// eleven - parse 'dog' or 'log' but nothing else
export const eleven: Parser<'dog' | 'log'> = alt(
  matchLiteral('dog'),
  matchLiteral('log')
)

type TrafficLights =
  | { type: 'Stop' }
  | { type: 'GetReady' }
  | { type: 'Go' }

// twelve - parse 'red' 'yellow' or 'green' into datatype
export const twelve: Parser<TrafficLights> = altMany<TrafficLights>(
  map(matchLiteral('red'), _ => ({ type: 'Stop' })),
  map(matchLiteral('yellow'), _ => ({ type: 'GetReady' })),
  map(matchLiteral('green'), _ => ({ type: 'Go' }))
)

// bonus - can you extract a useful combinator from the above?

// BIG EXERCISE ONE
//
// That's a lot of tools up there, let create a parser that takes an email and
// breaks it into it's useful parts

// example: person@bulb.co.uk
// would become { name: 'person', country: "UK" }

type EmailCountry = 'UK' | 'USA' | 'SPAIN' | 'FRANCE'

export type BulbEmailAddress = {
  name: string
  country: EmailCountry
}

const ukParser: Parser<EmailCountry> = undefined as any
const usaParser: Parser<EmailCountry> = undefined as any
const spainParser: Parser<EmailCountry> = undefined as any
const franceParser: Parser<EmailCountry> = undefined as any

export const emailCountryParser: Parser<EmailCountry> = altMany(
  ukParser,
  usaParser,
  spainParser,
  franceParser
)

export const bulbEmailParser: Parser<BulbEmailAddress> = undefined as any

// BIG EXERCISE TWO
//
// Great job. For this one, the final combinator `msnParser` has been created,
// you just need to provide the small parsers that it's built from
//
// Codes taken from https://en.wikipedia.org/wiki/Meter_serial_number
//

/*
A, B, D, Z	AMPY (now owned by Landis + Gyr)
C	CEWE
D	Landis + Gyr
E	EDMI
F	Siemens Metering Ltd (also FML, Ferranti)
H	Secure Controls
I	Iskraemeco
J	Jinling (Shanghai Electricity)
K	Elster/ABB
L	Landis + Gyr
M	General Electric
P	(PRI) Polymeters Response International
R	Sagem
S	Actaris/Schlumberger (now owned by Itron)[1][2]
*/

// some types...
type ManufacturerCode =
  | 'AMPY'
  | 'CEWE'
  | 'Landis+Gyr'
  | 'EDMI'
  | 'Siemens'
  | 'Secure'
  | 'Iskraemeco'
  | 'Jinling'
  | 'Elster'
  | 'GeneralElectric'
  | 'Polymeters'
  | 'Sagem'
  | 'Actaris'

type Year = number

type BatchNumber = number

type PurchasingCompany = string

type MeterSerialNumber = {
  manufacturer: ManufacturerCode
  year: Year
  purchasingCompany: PurchasingCompany
  batchNumber: BatchNumber
}

// two digit number
export const yearParser: Parser<Year> = undefined as any

// five or six digit number
export const batchNumberParser: Parser<BatchNumber> = undefined as any

// which manufacturer is this meter?
export const manufacturerParser: Parser<ManufacturerCode> = undefined as any

// which company purchased this meter?
export const purchasingCompanyParser: Parser<PurchasingCompany> = undefined as any

// our complete parser
export const msnParser: Parser<MeterSerialNumber> = map(
  pair(
    pair(manufacturerParser, yearParser),
    pair(purchasingCompanyParser, batchNumberParser)
  ),
  ([[manufacturer, year], [purchasingCompany, batchNumber]]) => ({
    manufacturer,
    year,
    purchasingCompany,
    batchNumber,
  })
)
