import * as W from 'fp-ts/lib/Writer'
import { Monoid } from 'fp-ts/lib/Monoid'
import { pipe, pipeable } from 'fp-ts/lib/pipeable'

type Cmd =
  | { type: 'None' }
  | { type: 'Log'; message: string }
  | { type: 'Many'; one: Cmd; two: Cmd }

const logCmd = (message: string): Cmd => ({
  type: 'Log',
  message,
})

const noCmd: Cmd = { type: 'None' }

const manyCmd = (one: Cmd, two: Cmd): Cmd => ({
  type: 'Many',
  one,
  two,
})

const monoidCmd: Monoid<Cmd> = {
  empty: noCmd,
  concat: (x, y) => {
    if (y.type === 'None') {
      return x
    }
    if (x.type === 'None') {
      return y
    }
    return manyCmd(x, y)
  },
}

// SW: Monad2C<"Writer", string>
const SW = W.getMonad(monoidCmd)

pipe(SW.of(2), w => SW.map(w, x => x + 1))

// pipeable functions
const {
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
} = pipeable(SW)

const withCmd = <A>(cmd: Cmd, state: A): W.Writer<Cmd, A> => () => [
  state,
  cmd,
]

const withNoCmd = <A>(state: A): W.Writer<Cmd, A> => SW.of(state)

type MyAction =
  | { type: 'Fetch'; breed: string }
  | { type: 'ReceiveDog'; url: string }

// the type of a reducer - it takes a state and an action
// and returns a new action, and a command
type WriterReducer<Action, State, Command> = (
  action: Action,
  state: State
) => W.Writer<Command, State>

type State = {
  loading: boolean
  url: string | null
}

const reducer: WriterReducer<MyAction, State, Cmd> = (
  action,
  state
) => {
  if (action.type === 'Fetch') {
    return withCmd(logCmd('Fetch!'), { ...state, loading: true })
  }
  if (action.type === 'ReceiveDog') {
    return withNoCmd({ ...state, loading: false, url: action.url })
  }
  return withNoCmd(state)
}
