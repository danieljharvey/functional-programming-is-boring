export type Semigroup<A> = {
  append: (one: A, two: A) => A;
};

export const monoidArray = undefined as any;

export const monoidString = undefined as any;

export type Monoid<A> = {
  empty: A;
} & Semigroup<A>;

export const monoidAnd = undefined as any;

// we can combine them...
export type Nothing = { type: "Nothing" };
export type Just<A> = { type: "Just"; value: A };
export type Maybe<A> = Nothing | Just<A>;

export const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

export const nothing = (): Maybe<never> => ({ type: "Nothing" });

export const monoidMaybe = undefined as any;

export const monoidMaybeString = undefined as any;

////

// combines numbers with addition
const monoidSum = undefined as any;

export const monoidMaybeSum = undefined as any;

//////////////

export const monoidFirst = undefined as any;

// concat :: Monoid<A> -> A[] -> A
export const concat = <A>(monoid: Monoid<A>, list: A[]): A =>
  list.reduce(monoid.append, monoid.empty);
