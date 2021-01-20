export type Semigroup<A> = {
  append: (one: A, two: A) => A
}

// combines two arrays with concatenation
export const monoidArray = <A>(): Monoid<A[]> => undefined as any

// combine two strings with concatenation
export const monoidString: Monoid<string> = undefined as any

export type Monoid<A> = {
  empty: A
} & Semigroup<A>

// combine two booleans with &&
export const monoidAnd: Monoid<boolean> = undefined as any

// we can combine them...
export type Nothing = { type: 'Nothing' }
export type Just<A> = { type: 'Just'; value: A }
export type Option<A> = Nothing | Just<A>

export const just = <A>(value: A): Option<A> => ({
  type: 'Just',
  value,
})

export const nothing = (): Option<never> => ({ type: 'Nothing' })

// this combines two Option<A> values
export const monoidOption = <A>(
  monoid: Monoid<A>
): Monoid<Option<A>> => undefined as any

// this combines two Option<string> values
export const monoidOptionString: Monoid<Option<
  string
>> = undefined as any

////

// combines numbers with addition
export const monoidSum: Monoid<number> = undefined as any

// this combines two Option<number> values with addition
export const monoidOptionSum: Monoid<Option<
  number
>> = undefined as any

//////////////

// this combines two Option values, returning the first one that is Just (or Nothing if neither are)
export const monoidFirst = <A>(): Monoid<Option<A>> =>
  undefined as any

// combine lots of A using Monoid<A>
// concat :: Monoid<A> -> A[] -> A
export const concat = <A>(monoid: Monoid<A>, list: A[]): A =>
  list.reduce(monoid.append, monoid.empty)
