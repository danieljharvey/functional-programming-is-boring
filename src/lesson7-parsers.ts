// rustle up a quick option type

export type Some<A> = { type: 'Some'; value: A }
export type None = { type: 'None' }
export type Option<A> = None | Some<A>

export const some = <A>(value: A): Option<A> => ({
  type: 'Some',
  value,
})

export const none = (): Option<never> => ({ type: 'None' })

export const optionMap = <A, B>(
  f: (a: A) => B,
  option: Option<A>
): Option<B> =>
  option.type === 'Some' ? some(f(option.value)) : none()

export const isNone = <A>(option: Option<A>): option is None =>
  option.type === 'None'

export const isSome = <A>(option: Option<A>): option is Some<A> =>
  !isNone(option)

// and off we go...

// Parser A
export type Parser<A> = {
  type: 'Parser'
  parse: (input: string) => Option<[string, A]>
}

// basic constructor
export const makeParser = <A>(
  parse: (input: string) => Option<[string, A]>
): Parser<A> => ({
  type: 'Parser',
  parse,
})

export const runParser = <A>(
  parser: Parser<A>,
  input: string
): Option<A> => {
  const result = parser.parse(input)
  if (isNone(result)) {
    return none()
  }
  return result.value[0].length === 0
    ? some(result.value[1])
    : none()
}

// take the first X characters of string, returns null if X is over string
// length
const splitString = (
  input: string,
  length: number
): [string | null, string] => {
  const match = input.slice(0, length)
  const actualMatch = match.length >= length ? match : null
  const rest = input.slice(length)
  return [actualMatch, rest]
}

// map the item we've parsed into something else
export const map = <A, B>(
  parser: Parser<A>,
  f: (a: A) => B
): Parser<B> =>
  makeParser((input) =>
    optionMap(([rest, a]) => [rest, f(a)], parser.parse(input))
  )

// try parser1 then parser2
export const alt = <A>(
  parser1: Parser<A>,
  parser2: Parser<A>
): Parser<A> =>
  makeParser((input) => {
    const resultA = parser1.parse(input)
    if (isSome(resultA)) {
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
  makeParser((input) => {
    const result = parserA.parse(input)
    if (isNone(result)) {
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
  makeParser((input) => {
    const resultA = parserA.parse(input)
    if (isNone(resultA)) {
      return resultA
    }
    const [rest, a] = resultA.value
    const resultB = parserB.parse(rest)
    if (isNone(resultB)) {
      return resultB
    }
    const [restB, b] = resultB.value

    return some([restB, [a, b]])
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
  makeParser((input) => {
    const res = parserA.parse(input)
    if (isNone(res)) {
      return res
    }
    let [next, result] = res.value
    let results = [result]
    while (true) {
      const parsed = parserA.parse(next)
      if (isSome(parsed)) {
        next = parsed.value[0]
        results.push(parsed.value[1])
      } else {
        break
      }
    }
    return some([next, results])
  })

// given a parser, return an array with zero or more matches
export const zeroOrMore = <A>(parserA: Parser<A>): Parser<A[]> =>
  makeParser((input) => {
    let next = input
    let results = []
    while (true) {
      const parsed = parserA.parse(next)
      if (isSome(parsed)) {
        next = parsed.value[0]
        results.push(parsed.value[1])
      } else {
        break
      }
    }
    return some([next, results])
  })

// a parser that matches any character
export const anyChar = makeParser((input) => {
  const [match, rest] = splitString(input, 1)
  return match !== null ? some([rest, match]) : none()
})

// given a parser, and a predicate, return a new, fussier parser
export const pred = <A>(
  parser: Parser<A>,
  predicate: (a: A) => boolean
): Parser<A> =>
  makeParser((input) => {
    const result = parser.parse(input)
    if (isNone(result)) {
      return result
    }
    const [rest, a] = result.value
    return predicate(a) ? some([rest, a]) : none()
  })

// parser that matches 'lit' exactly or fails
export const matchLiteral = <Lit extends string>(
  lit: Lit
): Parser<Lit> =>
  makeParser((input) => {
    const [match, rest] = splitString(input, lit.length)
    return match === lit ? some([rest, lit]) : none()
  })

// predicate for number
const isNumber = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (
    code > 47 && code < 58 // numeric (0-9)
  )
}

// predicate for letter
const isLetter = (char: string): boolean => {
  const code = char.charCodeAt(0)
  return (
    (code > 64 && code < 91) || // upper alpha (A-Z)
    (code > 96 && code < 123) // lower alpha (a-z)
  )
}

// predicate for a char which is a letter or number
const isAlphaNumeric = (char: string): boolean =>
  isLetter(char) || isNumber(char)

// parse a single alphanumeric char
export const alphaNumeric = pred(anyChar, isAlphaNumeric)

// parse a single digit
export const number = pred(anyChar, isNumber)

// parse a string of alphanumeric chars
export const identifier = map(oneOrMore(alphaNumeric), (as) =>
  as.join('')
)

// parses a single piece of whitespace
export const whitespace = pred(anyChar, (a) => a.trim() === '')

// parser of optional space
export const space0 = zeroOrMore(whitespace)

// parser of required space
export const space1 = oneOrMore(whitespace)

// if parsers finds match, return output
const mapLiteral = <A>(match: string, output: A): Parser<A> =>
  map(matchLiteral(match), (_) => output)

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

const emailCountryParser: Parser<EmailCountry> = altMany(
  ukParser,
  usaParser,
  spainParser,
  franceParser
)

export const bulbEmailParser: Parser<BulbEmailAddress> = undefined as any

////////////
// Exercise - meter serial numbers as per https://en.wikipedia.org/wiki/Meter_serial_number
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

export const manufacturerParser: Parser<ManufacturerCode> = undefined as any

export const purchasingCompanyParser: Parser<PurchasingCompany> = undefined as any

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
