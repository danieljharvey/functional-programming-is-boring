// rustle up a quick maybe type

type Just<A> = { type: "Just"; value: A };
type Nothing = { type: "Nothing" };
type Maybe<A> = Nothing | Just<A>;

const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

const nothing = (): Maybe<never> => ({ type: "Nothing" });

const maybeMap = <A, B>(f: (a: A) => B, maybe: Maybe<A>): Maybe<B> =>
  maybe.type === "Just" ? just(f(maybe.value)) : nothing();

const isNothing = <A>(maybe: Maybe<A>): maybe is Nothing =>
  maybe.type === "Nothing";

const isJust = <A>(maybe: Maybe<A>): maybe is Just<A> => !isNothing(maybe);

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

// predicate for a char which is a letter or number
const isAlphaNumeric = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return (
    (code > 47 && code < 58) || // numeric (0-9)
    (code > 64 && code < 91) || // upper alpha (A-Z)
    (code > 96 && code < 123) // lower alpha (a-z)
  );
};

// parse a single alphanumeric char
export const alphaNumeric = pred(anyChar, isAlphaNumeric);

// parse a string of alphanumeric chars
export const identifier = map(oneOrMore(alphaNumeric), as => as.join(""));

// parses a single piece of whitespace
export const whitespace = pred(anyChar, a => a.trim() === "");

// parser of optional space
export const space0 = zeroOrMore(whitespace);

// parser of required space
export const space1 = oneOrMore(whitespace);
