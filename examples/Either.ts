import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Apply'
import { pipe } from 'fp-ts/function'

// we're going to validate this Form to check that everything is good
type Form = {
  name: string
  age: number
  agreesToReceiveMarketingMessages: boolean
}

//  these are the types of errors that can go wrong
//  we are keeping these as string literals
//  so we can convert these into error messages later on
//  (this is helpful to keep those in one place or for
//  translations etc)
type FormError =
  | 'NO_NAME'
  | 'NAME_IS_HORSE'
  | 'AGE_TOO_LOW'
  | 'MUST_AGREE_TO_OBLIGATORY_MARKETING_MESSAGING'

// if everything goes well, we'll have this new type that shows our
// form has been validated. Using a new type means we can use the type system
// to track where we're using validated vs non-validated data
type GoodForm = {
  type: 'GoodForm'
  name: string
  age: number
  agreesToReceiveMarketingMessages: true
}

// here is our first validator, that checks whether the name is not empty
// and is not 'horse'
export const checkName = (
  name: string
): E.Either<FormError, string> => {
  if (name.length < 1) {
    return E.left('NO_NAME')
  }
  if (name.toLowerCase() == 'horse') {
    return E.left('NAME_IS_HORSE')
  }
  return E.right(name)
}

checkName('Bruce') // E.right('Bruce')
checkName('Horse') // E.left('NAME_IS_HORSE')
checkName('') // E.left('NO_NAME')

// now we are going to check the age is valid. The only thing we are
// worried about is whether it's non-negative for now
export const checkAge = (age: number): E.Either<FormError, number> =>
  age > -1 ? E.right(age) : E.left('AGE_TOO_LOW')

checkAge(100) // E.right(100)
checkAge(-1) // E.left('AGE_TOO_LOW')

// we need to validate whether the user agrees to receive
// marketing communications as we've decided those are not
// optional at all
export const checkMarketing = (
  agreesToReceiveMarketingMessages: boolean
): E.Either<FormError, true> =>
  agreesToReceiveMarketingMessages
    ? E.right(true)
    : E.left('MUST_AGREE_TO_OBLIGATORY_MARKETING_MESSAGING')

checkMarketing(true) // E.right(true)
checkMarketing(false) // E.left('MUST_AGREE_TO_OBLIGATORY_MARKETING_MESSAGING')

// make a sequence function - we must tell it to use Either
const sequenceT = A.sequenceT(E.either)

export const checkForm = (
  form: Form
): E.Either<FormError, GoodForm> =>
  pipe(
    // sequenceT takes a tuple of Either and turns them into either
    // a Left with the first error in
    // or a Right containing a tuple of good responses
    sequenceT(
      checkName(form.name),
      checkAge(form.age),
      checkMarketing(form.agreesToReceiveMarketingMessages)
    ),
    // if they all succeed, we can take all the winning values out
    // and combine them in our new GoodForm
    E.map(([name, age, marketing]) => ({
      type: 'GoodForm',
      name,
      age,
      agreesToReceiveMarketingMessages: marketing,
    }))
  )

checkForm({
  name: 'Bruce',
  age: 100,
  agreesToReceiveMarketingMessages: true,
})
// Right({ type: "GoodForm", name: "Bruce", age: 100,
// agreesToReceiveMarketingMessages: true})

checkForm({
  name: 'Bruce',
  age: -100,
  agreesToReceiveMarketingMessages: false,
})
// Left('AGE_TOO_LOW')

// finally, we might want to turn that error message into something nicer
const renderErrorMessage = (err: FormError): string => {
  switch (err) {
    case 'AGE_TOO_LOW':
      return 'Age must be a positive number'
    case 'NO_NAME':
      return 'Name must contain one or more characters'
    case 'NAME_IS_HORSE':
      return "Horse is not a person's name"
    case 'MUST_AGREE_TO_OBLIGATORY_MARKETING_MESSAGING':
      return 'You must agree to receive endless marketing information forever to continue'
  }
}

// now we can turn our previous checker into one that renders nice errors
export const checkFormWithNiceError = (
  form: Form
): E.Either<string, GoodForm> =>
  pipe(
    // this returns Either<FormError, GoodForm>
    checkForm(form),

    // mapLeft runs the provided function over the left value,
    // turning FormError into string
    E.mapLeft(renderErrorMessage)
  )

checkFormWithNiceError({
  name: 'Bruce',
  age: 100,
  agreesToReceiveMarketingMessages: true,
})
// Right({ type: "GoodForm", name: "Bruce", age: 100,
// agreesToReceiveMarketingMessages: true})

checkFormWithNiceError({
  name: 'Bruce',
  age: 100,
  agreesToReceiveMarketingMessages: false,
})
// Left('You must agree to receive endless marketing information forever to
// continue')
