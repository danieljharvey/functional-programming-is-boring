// my dude, what is a functor?

// a functor is something that can do `map`

// Map definition
// (Functor f) => (a -> b) ->     f a  ->    f b

// The second law says that composing two functions and then mapping the resulting function over a functor should be the same as first mapping one function over the functor and then mapping the other one. Formally written, that means that

// array is a functor
const as = [1, 2, 3].map((a) => a + 1)

// the rules are:

const id = <A>(a: A): A => a

// identity:
describe('functors', () => {
  it('array has identity', () => {
    const as = [1, 2, 3]
    expect(as.map(id)).toEqual(as)
  })

  it('array has composition', () => {
    const f = (a: number): string => `${a}`
    const g = (b: string): string => `${b}${b}`
    expect(as.map(f).map(g)).toEqual(as.map((a) => g(f(a))))
  })
})

// then there's your boy applicative

// ap :: (Functor f) => (f (a -> b)) -> f a -> f b

type Maybe<A> = { type: 'Some'; value: A } | { type: 'Nothing' }

const mapMaybe = <A, B>(
  f: Func1<A, B>,
  maybeA: Maybe<A>
): Maybe<B> => {
  if (maybeA.type === 'Some') {
    return { type: 'Some', value: f(maybeA.value) }
  }
  return { type: 'Nothing' }
}

const apMaybe = <A, B>(
  maybeF: Maybe<Func1<A, B>>,
  maybeA: Maybe<A>
): Maybe<B> => {
  if (maybeF.type === 'Some' && maybeA.type === 'Some') {
    return { type: 'Some', value: maybeF.value(maybeA.value) }
  }
  return { type: 'Nothing' }
}

const add = (a: number) => (b: number) => a + b
const add3 = add(3)

const pure = <A>(a: A): Maybe<A> => ({ type: 'Some', value: a })

console.log(mapMaybe(add3, pure(2)))
console.log(apMaybe(pure(add3), pure(2)))

// endomorphism :: A -> A

// Monad

// map >>> join === chain

const joinMaybe = <A>(mma: Maybe<Maybe<A>>): Maybe<A> =>
  mma.type === 'Some' && mma.value.type === 'Some'
    ? pure(mma.value.value)
    : { type: 'Nothing' }

const chainMaybe = <A, B>(
  f: Func1<A, Maybe<B>>,
  maybeA: Maybe<A>
): Maybe<B> => {
  if (maybeA.type === 'Some') {
    return f(maybeA.value)
  }
  return { type: 'Nothing' }
}

const chainMaybe2 = <A, B>(
  f: (a: A) => Maybe<B>,
  maybeA: Maybe<A>
): Maybe<B> => joinMaybe(mapMaybe(f, maybeA))

type Func1<A, B> = (a: A) => B

console.log(chainMaybe((itsAdd3) => pure(itsAdd3(2)), pure(add3)))
