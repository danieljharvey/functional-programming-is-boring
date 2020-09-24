export type Semigroup<A> = {
  append: (one: A, two: A) => A;
};

export const semigroupString: Semigroup<string> = {
  append: (a, b) => `${a}${b}`
};

export type Monoid<A> = {
  empty: A;
} & Semigroup<A>;

export const monoidAnd: Monoid<boolean> = {
  empty: true,
  append: (a, b) => a && b
};

// we can combine them...
export type Nothing = { type: "Nothing" };
export type Just<A> = { type: "Just"; value: A };
export type Maybe<A> = Nothing | Just<A>;

export const just = <A>(value: A): Maybe<A> => ({ type: "Just", value });

export const nothing = (): Maybe<never> => ({ type: "Nothing" });

export const monoidMaybe = <A>(
  semigroupA: Semigroup<A>
): Monoid<Maybe<A>> => ({
  empty: { type: "Nothing" },
  append: (a, b) => {
    if (a.type === "Just" && b.type === "Just") {
      return just(semigroupA.append(a.value, b.value));
    }
    return a.type === "Just" ? a : b;
  }
});

export const monoidMaybeString = monoidMaybe(semigroupString);

////

// combines numbers with addition
const monoidSum: Monoid<number> = {
  empty: 0,
  append: (a, b) => a + b
};

export const monoidMaybeSum = monoidMaybe(monoidSum);

//////////////

export const monoidFirst = <A>(): Monoid<Maybe<A>> => ({
  empty: nothing(),
  append: (a, b): Maybe<A> => (a.type === "Just" ? a : b)
});

/////

export const monoidMap = <A>(): Monoid<Map<number, A>> => ({
  empty: new Map(),
  append: (a, b) => {
    const arrA = Array.from(a);
    const arrB = Array.from(b);
    return new Map([...arrA, ...arrB]);
  }
});

// concat :: Monoid<A> -> A[] -> A
export const concat = <A>(monoid: Monoid<A>, list: A[]): A =>
  list.reduce(monoid.append, monoid.empty);

// todo - fast check these tests?
