---
title: Lesson 7 - Parsers 
author: Daniel J Harvey
patat:
  wrap: true
  margins:
    left: 10
    right: 10
    top: 10
    bottom: 10
  incrementalLists: true
...

# Part 7

## Parsers

Last time we looked at `optics`, particularly `lenses`, a way of getting
information from and changing structured data.

- But what if the data isn't structured yet?

- What can we do about that?

## Validation

Just to be clear, we are not talking about validation.

```typescript
const isFine = (data: any): boolean => {
  return ("id" in data && "name" in data)
}
```

- Validation tells us something about the data, but at the end, we have no more
  idea of it's structure.

- Parsing takes us from __unstructured__ to _structured_ data.

## Classic parsing

The classic pattern upon receiving external data as a string of `JSON`, is to do the following:

```typescript
const processApiStuff = (jsonStr: string): object | null => {
  try {
    // JSON.parse throws on failure because the world is unjust
    const json = JSON.parse(jsonStr)
    return json
  } catch {
    return null
  }
}
```

- (In a better world, we could inspect the error and make this more like `String -> Either MeaningfulError JSON`)

- (but I digress)

- The key thing is that at the end, we have parsed a `string` into some sort of
  `object` and thus it has gained structure.

## Refining

Libraries like `io-ts` let us further refine `object` into something more
  specific if we're feeling particularly type-safe.
```typescript
import * as t from 'io-ts'

const idNameThing = t.type({
  name: t.string,
  id: t.integer
})

type IdNameThing = t.TypeOf<typeof idNameThing>

idNameThing.decode({ id: 123, name: "Bruce" }) // Right IdNameThing

idNameThing.decode({ id: "Horse time", name: 123 }) // Left Error
```

- Again, we have gone from `object -> IdNameThing` and learned more about the structure 

## This sounds solved then

So this is all well and good for `JSON`, but what if we want to parse structure
from any lump of string data?

- This often goes one of two ways:

- A custom function:
```typescript
const decode = (input: string): string => {
  const start = input.slice(0,5)
  return start 
}
```

- A regex: `^dog$` or `//[^\r\n]*[\r\n]`

- What if I told you there was a third way?

- And that it was _composable_?

## Parser combinators

Parser combinators, like all functional programming abstractions, is about
taking tiny `Parser`s that do so little that it feels like almost nothing, and
combining them together to make big things that are hopefully still easy-ish to
understand.

- Easier than the equivalent regex anyhow.

- And easier to maintain than any hand rolled parsing function

- So what is a `Parser` here then?

- Easy!

- A parser of _things_ is a function from __strings__ to lists of pairs of __strings__
  and _things_

- By which of course, I mean:
```haskell
parser :: String -> [(String, A)]
```

- or
```typescript
type ParsingFunction<A> = (str: string) => [string, A][]
```

- It takes a `string` of something, and then returns a list of things it could
  be, each with the leftover `string`.

## Whoa now

There is a slightly simpler version which we will use today:

```typescript
type ParsingFunction<A> = (str: string) => Maybe<[string, A]>
```

- This takes a __string__ and then returns either `Nothing` (for "I could not
  parse this nonsense") or a `Just` with the remainder and the thing it parsed.

- We'll wrap it up like this so Typescript can keep up:
```typescript
type Parser<A> = { parse: (str: string) => Maybe<[string,A]> }
```

- The simplest one would be:

```typescript
anyChar :: Parser<string>
```

- This returns any single character.
```typescript
anyChar.parse("horse") // Just(["orse", "h"])
anyChar.parse("") // Nothing
```

## Combination time

Let's say we want it to be a bit more fussy? Let's introduce our first
  combinator:

```haskell
pred :: Parser A -> (A -> Boolean) -> Parser A
```

- Now we can ask for specifically capitalised letters:

```typescript
const isCapital = (char:string) => {
  const code = char.charCodeAt(0);
  return (
    (code > 64 && code < 91) // upper alpha (A-Z)
  );
}

const capitalChar: Parser<string> = 
  pred(anyChar, isCapital) 

capitalChar.parse("horse") // Nothing
capitalChar.parse("Horse") // Just(["orse", "H"])
```

- Great! How what about one for numbers?

```typescript
const isDigit = (char:string) => {
  const code = char.charCodeAt(0);
  return (
    (code > 47 && code < 58) // numeric (0-9)
  );
}

const digitChar: Parser<string> = 
  pred(anyChar, isNumber) 

digitChar.parse("horse") // Nothing
digitChar.parse("9 horses") // Just([" horses", "9"])
```

- We have a problem though, all we have now is a `string` that we know has a
  number in it?

- How do we turn `Parser<string>` into `Parser<number>`?

- .

- ..

- ...

- ....

- .....

## It's our old pal

Yes, you guessed it. It's our old friend, `map`.
```haskell
map :: (A -> B) -> Parser A -> Parser B
```

- Therefore we can make a `Parser<number>`.
```typescript
const digitParser: Parser<number> = map(digitChar, a => Number(a))

digitParser.parse("horse") // Nothing
digitParser.parse("123") // Just(["12",3])
```

- What about parsing more than one thing?

## oneOrMore and zeroOrMore

We have more combinators for grabbing multiple things.

```haskell
zeroOrMore :: Parser A -> Parser A[]
oneOrMore  :: Parser A -> Parser A[]
```

- These keep trying the same parser until they fail and return the results

- `oneOrMore` fails if we don't get any

- whilst `zeroOrMore` will happily return an empty array

- (strictly we could define a `NonEmpty` array type and `oneOrMore` would
  become `Parser A -> Parser (NonEmpty A)`. But not today.)

- Usually we'd then `map` over the result to combine the array of characters into something more useful.

- Let's grab a pile of capital letters 
```typescript
const capitalParser: Parser<string> = pred(anyChar, isCapital)

const shoutingWordParser: Parser<string> = 
  map(oneOrMore(capitalParser), as => as.join(''))

shoutingParser.parse("not shouting") // Nothing
shoutingParser.parse("SHOUTING time") // Just([" time", "SHOUTING"])
```

## Trying different things

We can try one parser, and then, if it fails, another.

```haskell
alt :: Parser A -> Parser A -> Parser A
altMany :: (Parser A)[] -> Parser A
```

- `alt` takes two parsers with the same type, and tries one, and then the other

- `altMany` takes an array of parsers and keeps trying them until one works

- Let's try them with the helpful `matchLiteral` function, which is a `Parser`
  that takes a `string` and matches if it's exactly the same.
```typescript
type Animal = "Dog" | "Cat" | "Horse"

const animalParser: Parser<Animal> = altMany(
  matchLiteral("Dog"),
  matchLiteral("Cat"),
  matchLiteral("Horse")
)

animalParser.parse("Bat hat") // Nothing
animalParser.parse("Horse course") // Just<[" course", "Horse"]>
```

## More combining

Now most things we want to parse have different elements inside that we want to
access. How do we look for `X` and then `Y`?

```haskell
pair :: Parser A -> Parser B -> Parser [A,B]
```

```typescript
const animalWithPunctuation: Parser<[Animal,string]>
  = pair(animalParser, matchLiteral("."))

animalWithPunctuation.parse("Horse") // Nothing
animalWithPunctuation.parse("Horse.") // Just<["", ["Horse","."]]>
```

- Often, we want to check elements are there, but we don't care about them, so
  we have these helpers:

```haskell
left  :: Parser A -> Parser B -> Parser A
right :: Parser A -> Parser B -> Parser B
```

```typescript
const animalParserLeft = left(animalParser, matchLiteral("."))

animalParserLeft.parse("Horse") // Nothing
animalParserLeft.parser("Horse.") // Just<["","Horse"]>
```

- We need the full stop to be there, but we don't want to keep it.

- Or perhaps we're incredibly interested in punctuation and nothing else
 ```typescript
const animalParserRight = right(animalParser, matchLiteral("."))

animalParserRight.parse("Dog") // Nothing
animalParserRight.parser("Dog.") // Just<["","."]>
```

## Great

That's a __LOT__ of things. I am sorry.

However, I would say that this stuff is a lot more intuitive once you start
using it a bit, so we should probably do that.

We are going to parse some _email addresses_, and then if we're really lucky,
some _meter serial numbers_. What a day.

