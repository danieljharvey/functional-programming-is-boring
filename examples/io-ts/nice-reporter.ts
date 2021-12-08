import * as t from 'io-ts'
import * as E from 'fp-ts/Either'

const getUniq = <A>(array: A[]): A[] => [...new Set(array)]

export const niceReporter = <A>(
  result: E.Either<t.Errors, A>
): string[] | A => {
  if (E.isRight(result)) {
    return result.right
  }

  return getUniq(result.left.map((err) => renderContext(err.context)))
}

const labelForCodec = (codec: t.Decoder<any, any>) => codec.name

const destroyNumbers = (str: string) => str.replace(/[0-9]/g, '')

// we want the longest key, that isn't a number ((???))
const sortByLongestKey = (entries: t.Context): t.Context =>
  [...entries].sort(
    (a, b) =>
      destroyNumbers(b.key).length - destroyNumbers(a.key).length
  )

const renderContext = (context: t.Context): string => {
  return (
    contextString(context) +
    renderContextItem(chooseContextEntry(context))
  )
}

const last = <A>(arr: readonly A[], fromEnd: number) =>
  arr[arr.length - fromEnd]

// for t.type we want the last item
// but for t.union we want the second last item because the specific one is
// boring
const chooseContextEntry = (context: t.Context): t.ContextEntry => {
  const sndLast = last(context, 2)

  if (sndLast && (sndLast.type as any)._tag === 'UnionType') {
    return sndLast
  }
  return last(context, 1)
}

const renderContextItem = (contextEntry: t.ContextEntry): string => {
  return `Expected ${labelForCodec(contextEntry.type)}, got ${
    contextEntry.actual
  }`
}

const contextString = (context: t.Context): string => {
  const ctx = context
    .map((contextEntry) => contextEntry.key)
    .filter((a) => destroyNumbers(a).length > 0)
    .join('.')
  return ctx.length > 0 ? `${ctx}: ` : ''
}
