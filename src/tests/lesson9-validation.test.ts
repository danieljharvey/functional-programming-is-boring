import { endpoint } from '../lesson9-validation'

import { isLeft, isRight } from 'fp-ts/lib/Either'

describe('Validation', () => {
  it('Fails api request validation', async () => {
    const response = await endpoint({ blah: true })()

    expect(isLeft(response) && response.left.type).toEqual(
      'RequestValidationFailure'
    )
  })

  it('Fails if age is under 0', async () => {
    const response = await endpoint({
      breed: 'pug',
      name: 'Stevie Bruceface',
      age: 0,
    })()
    expect(isLeft(response) && response.left.type).toEqual(
      'AgeTooLow'
    )
  })

  it('Fails if name empty', async () => {
    const response = await endpoint({
      breed: 'pug',
      name: '',
      age: 10,
    })()
    expect(isLeft(response) && response.left.type).toEqual(
      'NameIsEmpty'
    )
  })

  it('Get 200 as intended', async () => {
    const response = await endpoint({
      age: 100,
      name: 'dog',
      breed: 'pug',
    })()

    expect(isRight(response) && response.right.message).toContain(
      'dog'
    )
    expect(isRight(response) && response.right.message).toContain(
      '100'
    )
    expect(isRight(response) && response.right.url).toContain(
      'dog.ceo'
    )
  })
})
