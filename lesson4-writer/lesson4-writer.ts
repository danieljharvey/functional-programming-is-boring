type Writer<W,A> = { type: "Writer", value: A, logs: W[] }

// writer :: W[] -> A -> Writer W A
const writer = <W,A>(logs: W[], value :A): Writer<W,A> => ({
  type: "Writer",
  value,
  logs
})

console.log(writer(["Thing happened"],"dog"))

// pure :: A -> Writer<never,A>
const pure = <A>(value: A): Writer<never,A> => ({
  type: "Writer",
  value,
  logs: [] as never[]
})

console.log(pure('dog'))

// tell :: W -> A -> Writer W A
const tell = <W>(log: W): Writer<W,null> => writer([log],null)

console.log(tell("Hello"))

// map :: (A -> B) -> Writer W A -> Writer W B
const map = <W,A,B>(f: (a: A) => B, a: Writer<W,A>):Writer<W,B> => ({
  type: "Writer",
  value: f(a.value),
  logs: a.logs
})

console.log(map(a => a.toUpperCase(), pure('dog')))

// bind :: (A -> Writer W B) -> Writer W A -> Writer W B
const bind = <W,A,B>(fn: (a: A) => Writer<W,B>, a: Writer<W,A>): Writer<W,B> => {
  const next = fn(a.value)
  return writer(a.logs.concat(next.logs), next.value)
}

console.log(bind(a => tell("Oh no"),pure("Horse")))

// then :: Writer W B -> Writer W A -> Writer W B
const then = <W,A,B>(b: Writer<W,B>, a: Writer<W,A>): Writer<W,B> => bind(() => b, a)

// TODO example for this
