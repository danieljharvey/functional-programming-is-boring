# :egg: Functional Programming Is Boring :egg:

## A completely OK short course on FP for Bulb Engineers.

Click on the words for information about subjects and things.

[Intro](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/intro.md)

## Lessons, as such

### Lesson 1 - Option

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson1-option.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson1-option.ts)

### Lesson 2 - Either

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson2-either.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson2-either.ts)

### Lesson 3 - Monoids

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson3-semigroup-monoid.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson3-semigroups-monoids.ts)

### Lesson 4 - Continuations

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson4-continuations.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson4-continuations.ts)

### Lesson 5 - Reader

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson5-reader.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson5-reader.ts)

### Lesson 6 - Optics

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson6-optics.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson6-optics.ts)

### Lesson 7 - Parsers

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson7-parsers.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson7-parsers.ts)

### Lesson 8 - TaskEither

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson8-task-either.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson8-task-either.ts)

### Lesson 9 - Validation

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/lesson9-validation.md)

[Exercises](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/src/lesson9-validation.ts)

## Extra meandering things that didn't fit into any lesson

### Bonus 1 - Currying

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/currying.md)

### Bonus 2 - Complexity

[Information](https://github.com/danieljharvey/functional-programming-is-boring/blob/master/slides/complexity.md)

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
