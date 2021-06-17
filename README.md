# :egg: Functional Programming Is Boring :egg:

## A completely OK short course on FP for Bulb Engineers.

Click on the words for information about subjects and things.

[Intro](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/intro.md)

## Part 1

### Lesson 1 - Option

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson1-option.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson1-option.ts)

### Lesson 2 - Either

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson2-either.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson2-either.ts)

### Lesson 3 - Optics

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson3-optics.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson3-optics.ts)

### Lesson 4 - TaskEither

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson4-task-either.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson4-task-either.ts)

### Lesson 5 - Parsers

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson5-parsers.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson5-parsers.ts)

### Lesson 6 - Validation

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson6-validation.md) | [Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson6-validation.ts)

## Exercises

If you'd like to practise using `fp-ts` in the wild, here are some exercises
along with unit tests that you can use to increase your 10x-ing.

The tests for each unit are currently skipped, but can be enabled by removing
`skip` from the matching test file.

### Datatypes

These exercises are for specific types that you will find in `fp-ts`.

#### Control flow types

[Option](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/option.ts) | [Either](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/either.ts)

#### Stateful types

[State](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/state.ts) | [Writer](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/writer.ts)

### Typeclasses

After we've used a few datatypes we'll start to notice the same old functions (such as `map`) coming up over and over. These interfaces, reused between many types, are called typeclasses, these exercises are to help gain a better intuition for them by implementing their functions yourself.

#### Exercises

[Functor](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/functors.ts) | [Monoid](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/exercises/monoid.ts)

## Examples

Some more concrete examples of FP in the wild (please feel free to contribute here if you find something worth sharing)

[Option](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/option/Option.ts) | [Either](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/either/Either.ts) | [io-ts validator](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/io-ts/TimeFromString.ts) | [Store Comonad](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/comonads/Store.ts) | [Parser](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/parser/parser.ts) | [newtypes](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/examples/newtypes/newtypes.ts)

## Installing stuff

The exercises are in Typescript and be run as such:

```bash
yarn install

# tests
yarn test:watch

# typechecker
yarn typescript:watch
```

The tests for each exercise live in `src/tests`, and are all skipped, enable the ones you want to try.
