import {
  makeDisplayName1,
  makeDisplayName2,
  makeDisplayName3,
  isoSurname,
  isoFirstname,
  prismFirstname,
  prismSurname,
} from './newtypes'
import * as E from 'fp-ts/Either'

describe('basic case', () => {
  it('fails with empty first name', () => {
    expect(E.isLeft(makeDisplayName1('', 'dog'))).toBeTruthy()
  })
  it('fails with empty last name', () => {
    expect(E.isLeft(makeDisplayName1('log', ''))).toBeTruthy()
  })
  it('works otherwise', () => {
    expect(makeDisplayName1('dog', 'log')).toEqual(
      E.right('XXdogYYlog')
    )
    expect(makeDisplayName1('doggle', 'loggle')).toEqual(
      E.right('dogglloggl')
    )
  })
})

describe('with newtype', () => {
  it('fails with empty first name', () => {
    expect(
      E.isLeft(
        makeDisplayName2(
          isoFirstname.wrap(''),
          isoSurname.wrap('dog')
        )
      )
    ).toBeTruthy()
  })
  it('fails with empty last name', () => {
    expect(
      E.isLeft(
        makeDisplayName2(
          isoFirstname.wrap('log'),
          isoSurname.wrap('')
        )
      )
    ).toBeTruthy()
  })
  it('works otherwise', () => {
    expect(
      makeDisplayName2(
        isoFirstname.wrap('dog'),
        isoSurname.wrap('log')
      )
    ).toEqual(E.right('XXdogYYlog'))
    /*  
    this doesn't work because type safety
    makeDisplayName2(
        isoSurname.wrap('loggle')
        isoFirstname.wrap('doggle'),
      )
  */
    expect(
      makeDisplayName2(
        isoFirstname.wrap('doggle'),
        isoSurname.wrap('loggle')
      )
    ).toEqual(E.right('dogglloggl'))
  })
})

describe('with refinement type', () => {
  it('works 1', () => {
    const firstname = prismFirstname.getOption('dog')

    const surname = prismSurname.getOption('log')

    const result =
      firstname._tag === 'Some' &&
      surname._tag === 'Some' &&
      makeDisplayName3(firstname.value, surname.value)

    expect(result).toEqual('XXdogYYlog')
  })

  it('works 2', () => {
    const firstname = prismFirstname.getOption('doggle')

    const surname = prismSurname.getOption('loggle')

    const result =
      firstname._tag === 'Some' &&
      surname._tag === 'Some' &&
      makeDisplayName3(firstname.value, surname.value)

    expect(result).toEqual('dogglloggl')
  })
})
