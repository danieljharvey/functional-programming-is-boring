import * as E from 'fp-ts/Either'

import { Newtype, iso, prism } from 'newtype-ts'

// example request type
export type DisplayNameRequest1 = {
  firstname: string
  surname: string
}

export const makeDisplayName1 = (
  firstname: string,
  surname: string
): E.Either<string, string> => {
  if (firstname.length < 1) {
    return E.left('first name is empty')
  }
  if (surname.length < 1) {
    return E.left('surname  is empty')
  }
  return E.right(
    firstname.slice(0, 5).padStart(5, 'X') +
      surname.slice(0, 5).padStart(5, 'Y')
  )
}

// let's say we are very scared of mixing up the two names
// instead of treating them as strings we make `newtypes` for them

// we can use these with io-ts to deserialise directly into these values:
// https://github.com/gcanti/io-ts/blob/master/index.md#branded-types--refinements

type Firstname = Newtype<
  { readonly Firstname: unique symbol },
  string
>

type Surname = Newtype<{ readonly Surname: unique symbol }, string>

// simple example
export type DisplayNameRequest2 = {
  firstname: Firstname
  surname: Surname
}

// an iso is an optic for changing between two equivalent types
export const isoFirstname = iso<Firstname>()
export const isoSurname = iso<Surname>()

export const makeDisplayName2 = (
  firstname: Firstname,
  surname: Surname
): E.Either<string, string> => {
  // unwrap the newtype to get the delicious raw string inside
  const strFirstname = isoFirstname.unwrap(firstname)
  if (strFirstname.length < 1) {
    return E.left('first name is empty')
  }
  // unwrap the newtype to get the delicious raw string inside
  const strSurname = isoSurname.unwrap(surname)
  if (strSurname.length < 1) {
    return E.left('surname  is empty')
  }
  return E.right(
    strFirstname.slice(0, 5).padStart(5, 'X') +
      strSurname.slice(0, 5).padStart(5, 'Y')
  )
}

/////////////////////////////////////

// but it's all very 1x still because we still return an Either for what is a
// very simple function
// what if our type also gave us some guarantees about the information inside

type NEFirstname = Newtype<
  { readonly NEFirstname: unique symbol },
  string
>

type NESurname = Newtype<
  { readonly NESurname: unique symbol },
  string
>

// complex example
export type DisplayNameRequest3 = {
  firstname: NEFirstname
  surname: NESurname
}

// predicate that must be satisfied to create a NEFirstname or NESurname
const isNonEmpty = (s: string) => s.length > 0

// an iso is an optic for changing between two equivalent types
export const prismFirstname = prism<NEFirstname>(isNonEmpty)
export const prismSurname = prism<NESurname>(isNonEmpty)

// no more Eithers
export const makeDisplayName3 = (
  firstname: NEFirstname,
  surname: NESurname
): string => {
  const strFirstname = prismFirstname.reverseGet(firstname)
  const strSurname = prismSurname.reverseGet(surname)
  return (
    strFirstname.slice(0, 5).padStart(5, 'X') +
    strSurname.slice(0, 5).padStart(5, 'Y')
  )
}
