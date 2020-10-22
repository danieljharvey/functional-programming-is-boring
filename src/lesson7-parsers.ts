// rustle up a quick maybe type

export type Just<A> = { type: "Just"; value: A };
export type Nothing = { type: "Nothing" };
export type Maybe<A> = Nothing | Just<A>;

export const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

export const nothing = (): Maybe<never> => ({ type: "Nothing" });

export const maybeMap = <A, B>(f: (a: A) => B, maybe: Maybe<A>): Maybe<B> =>
  maybe.type === "Just" ? just(f(maybe.value)) : nothing();

export const isNothing = <A>(maybe: Maybe<A>): maybe is Nothing =>
  maybe.type === "Nothing";

export const isJust = <A>(maybe: Maybe<A>): maybe is Just<A> =>
  !isNothing(maybe);

// and off we go...

// Parser A
export type Parser<A> = {
  type: "Parser";
  parse: (input: string) => Maybe<[string, A]>;
};

// basic constructor
export const makeParser = <A>(
  parse: (input: string) => Maybe<[string, A]>
): Parser<A> => ({
  type: "Parser",
  parse
});

export const runParser = <A>(parser: Parser<A>, input: string): Maybe<A> => {
  const result = parser.parse(input);
  if (isNothing(result)) {
    return nothing();
  }
  return result.value[0].length === 0 ? just(result.value[1]) : nothing();
};

// take the first X characters of string, returns null if X is over string
// length
const splitString = (
  input: string,
  length: number
): [string | null, string] => {
  const match = input.slice(0, length);
  const actualMatch = match.length >= length ? match : null;
  const rest = input.slice(length);
  return [actualMatch, rest];
};

// map the item we've parsed into something else
export const map = <A, B>(parser: Parser<A>, f: (a: A) => B): Parser<B> =>
  makeParser(input =>
    maybeMap(([rest, a]) => [rest, f(a)], parser.parse(input))
  );

// try parser1 then parser2
export const alt = <A>(parser1: Parser<A>, parser2: Parser<A>): Parser<A> =>
  makeParser(input => {
    const resultA = parser1.parse(input);
    if (isJust(resultA)) {
      return resultA;
    }
    return parser2.parse(input);
  });

// provide a list of alternatives that will be tried in order
export const altMany = <A>(
  parser1: Parser<A>,
  ...parsers: Parser<A>[]
): Parser<A> => parsers.reduce((total, parser) => alt(total, parser), parser1);

// try parserA, and if succeeds, pass the result to thenParserB
export const andThen = <A, B>(
  parserA: Parser<A>,
  thenParserB: (a: A) => Parser<B>
): Parser<B> =>
  makeParser(input => {
    const result = parserA.parse(input);
    if (isNothing(result)) {
      return result;
    }
    const [next, a] = result.value;
    return thenParserB(a).parse(next);
  });

// take two parsers, and return a parser that parses two things in sequence
// and puts them in a tuple
export const pair = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<[A, B]> =>
  makeParser(input => {
    const resultA = parserA.parse(input);
    if (isNothing(resultA)) {
      return resultA;
    }
    const [rest, a] = resultA.value;
    const resultB = parserB.parse(rest);
    if (isNothing(resultB)) {
      return resultB;
    }
    const [restB, b] = resultB.value;

    return just([restB, [a, b]]);
  });

// parse two things, then discard the second one
export const left = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<A> => map(pair(parserA, parserB), ([a, _]) => a);

// parse two things, then discard the first one
export const right = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>
): Parser<B> => map(pair(parserA, parserB), ([_, b]) => b);

// given a parser, return an array with one or more matches
export const oneOrMore = <A>(parserA: Parser<A>): Parser<A[]> =>
  makeParser(input => {
    const res = parserA.parse(input);
    if (isNothing(res)) {
      return res;
    }
    let [next, result] = res.value;
    let results = [result];
    while (true) {
      const parsed = parserA.parse(next);
      if (isJust(parsed)) {
        next = parsed.value[0];
        results.push(parsed.value[1]);
      } else {
        break;
      }
    }
    return just([next, results]);
  });

// given a parser, return an array with zero or more matches
export const zeroOrMore = <A>(parserA: Parser<A>): Parser<A[]> =>
  makeParser(input => {
    let next = input;
    let results = [];
    while (true) {
      const parsed = parserA.parse(next);
      if (isJust(parsed)) {
        next = parsed.value[0];
        results.push(parsed.value[1]);
      } else {
        break;
      }
    }
    return just([next, results]);
  });

// a parser that matches any character
export const anyChar = makeParser(input => {
  const [match, rest] = splitString(input, 1);
  return match !== null ? just([rest, match]) : nothing();
});

// given a parser, and a predicate, return a new, fussier parser
export const pred = <A>(
  parser: Parser<A>,
  predicate: (a: A) => boolean
): Parser<A> =>
  makeParser(input => {
    const result = parser.parse(input);
    if (isNothing(result)) {
      return result;
    }
    const [rest, a] = result.value;
    return predicate(a) ? just([rest, a]) : nothing();
  });

// parser that matches 'lit' exactly or fails
export const matchLiteral = <Lit extends string>(lit: Lit): Parser<Lit> =>
  makeParser(input => {
    const [match, rest] = splitString(input, lit.length);
    return match === lit ? just([rest, lit]) : nothing();
  });

// predicate for number
const isNumber = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    code > 47 && code < 58 // numeric (0-9)
  );
};

// predicate for letter
const isLetter = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code > 64 && code < 91) || // upper alpha (A-Z)
    (code > 96 && code < 123) // lower alpha (a-z)
  );
};

// predicate for a char which is a letter or number
const isAlphaNumeric = (char: string): boolean =>
  isLetter(char) || isNumber(char);

// parse a single alphanumeric char
export const alphaNumeric = pred(anyChar, isAlphaNumeric);

// parse a single digit
export const number = pred(anyChar, isNumber);

// parse a string of alphanumeric chars
export const identifier = map(oneOrMore(alphaNumeric), as => as.join(""));

// parses a single piece of whitespace
export const whitespace = pred(anyChar, a => a.trim() === "");

// parser of optional space
export const space0 = zeroOrMore(whitespace);

// parser of required space
export const space1 = oneOrMore(whitespace);

// if parsers finds match, return output
const mapLiteral = <A>(match: string, output: A): Parser<A> =>
  map(matchLiteral(match), _ => output);

// example: person@bulb.co.uk
// would become { name: 'person', country: "UK" }

type EmailCountry = "UK" | "USA" | "SPAIN" | "FRANCE";

export type BulbEmailAddress = {
  name: string;
  country: EmailCountry;
};

const ukParser: Parser<EmailCountry> = mapLiteral("co.uk", "UK");
const usaParser: Parser<EmailCountry> = mapLiteral("com", "USA");
const spainParser: Parser<EmailCountry> = mapLiteral("es", "SPAIN");
const franceParser: Parser<EmailCountry> = mapLiteral("fr", "FRANCE");

const emailCountryParser: Parser<EmailCountry> = altMany(
  ukParser,
  usaParser,
  spainParser,
  franceParser
);

export const bulbEmailParser: Parser<BulbEmailAddress> = map(
  pair(
    left(identifier, matchLiteral("@bulb")),
    right(matchLiteral("."), emailCountryParser)
  ),
  ([name, country]) => ({ name, country })
);

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
  | "AMPY"
  | "CEWE"
  | "Landis+Gyr"
  | "EDMI"
  | "Siemens"
  | "Secure"
  | "Iskraemeco"
  | "Jinling"
  | "Elster"
  | "GeneralElectric"
  | "Polymeters"
  | "Sagem"
  | "Actaris";

type Year = number;

type BatchNumber = number;

type PurchasingCompany = string;

type MeterSerialNumber = {
  manufacturer: ManufacturerCode;
  year: Year;
  purchasingCompany: PurchasingCompany;
  batchNumber: BatchNumber;
};

// two digit number
export const yearParser: Parser<Year> = map(pair(number, number), ([a, b]) =>
  Number(`${a}${b}`)
);

// five or six digit number
export const batchNumberParser: Parser<BatchNumber> = map(
  pred(
    map(oneOrMore(number), as => as.join("")),
    a => a.length === 6 || a.length === 5
  ),
  Number
);

const landis: Parser<ManufacturerCode> = map(
  altMany(
    matchLiteral("A"),
    matchLiteral("B"),
    matchLiteral("D"),
    matchLiteral("Z")
  ),
  _ => "Landis+Gyr"
);

export const manufacturerParser: Parser<ManufacturerCode> = altMany(
  landis,
  mapLiteral("C", "CEWE"),
  mapLiteral("D", "Landis+Gyr"),
  mapLiteral("E", "EDMI"),
  mapLiteral("F", "Siemens"),
  mapLiteral("H", "Secure")
);

export const purchasingCompanyParser = map(
  pair(anyChar, anyChar),
  ([a, b]) => `${a}${b}`
);

export const msnParser: Parser<MeterSerialNumber> = map(
  pair(
    pair(manufacturerParser, yearParser),
    pair(purchasingCompanyParser, batchNumberParser)
  ),
  ([[manufacturer, year], [purchasingCompany, batchNumber]]) => ({
    manufacturer,
    year,
    purchasingCompany,
    batchNumber
  })
);
