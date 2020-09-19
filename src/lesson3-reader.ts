export type Reader<R, A> = { type: "Reader"; runReader: (r: R) => A };

// most basic constructor
export const reader = <R, A>(runReader: (r: R) => A): Reader<R, A> => ({
  type: "Reader",
  runReader
});

// take A and plop it into the Reader context
export const pure = <R, A>(a: A): Reader<R, A> => ({
  type: "Reader",
  runReader: _ => a
});

// run the computation, by passing it the environment
const runReader = <R, A>(environment: R, value: Reader<R, A>): A =>
  value.runReader(environment);

// the environment we are going to use
type HorseInformation = {
  expectedLegs: number;
  expectedTail: boolean;
  acceptableNames: string[];
};

// Simplest Reader example (ignores the environment)

const horseInformation: HorseInformation = {
  expectedLegs: 4,
  expectedTail: true,
  acceptableNames: ["CHAMPION", "HOOVES GALORE", "HAM GAMALAN"]
};

const read1 = pure("Horses");

console.log(runReader(horseInformation, read1));
// "Horses"

// Let's add mapping
export const map = <R, A, B>(
  fn: (a: A) => B,
  reader: Reader<R, A>
): Reader<R, B> => ({
  type: "Reader",
  runReader: r => fn(reader.runReader(r))
});

const read2 = map(a => a.toUpperCase(), pure("Horses"));

console.log(runReader(horseInformation, read2));
// "HORSES"

export const bind = <R, A, B>(
  fn: (a: A) => Reader<R, B>,
  reader: Reader<R, A>
): Reader<R, B> => ({
  type: "Reader",
  runReader: r => fn(reader.runReader(r)).runReader(r)
});

const horseNameExists = (
  horseName: string
): Reader<HorseInformation, string> =>
  reader(horseInfo =>
    horseInfo.acceptableNames.indexOf(horseName) !== -1
      ? `${horseName} is an acceptable horse`
      : `No dice, ${horseName}.`
  );

const read3 = bind(horseNameExists, pure("George"));

console.log(runReader(horseInformation, read3));
// No dice, George

const read4 = bind(horseNameExists, pure("HOOVES GALORE"));

console.log(runReader(horseInformation, read4));
// HOOVES GALORE is an acceptable horse
