# Currying

## A note on currying

Often in functional languages (or indeed, in libraries like `Ramda` or `fp-ts`)
our functions are `curried`

This means they are split into single arity functions that each return the rest
of the function.

The regular example is this:

```typescript
const add = (a,b) => a + b
```

- becoming this...

```typescript
const addCurried = a => b => a + b
```

- which allows

```typescript
const add2 = addCurried(2)

add2(1) // 3
```

- This is used a lot so that functions like `map` and `bind` can be used
  point-free.

- It does make things a lot more dense though

