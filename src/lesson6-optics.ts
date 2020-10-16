import { Lens } from "monocle-ts";

const statusCodeL = Lens.fromProp<Response>()("statusCode");
const dataL = Lens.fromProp<Response>()("data");

const timestampL = dataL.compose(Lens.fromProp<Data>()("timestamp"));

const stableL = dataL.compose(Lens.fromProp<Data>()("stable"));
const postcodeL = stableL.compose(Lens.fromProp<Stable>()("postcode"));

const horseL = stableL.compose(Lens.fromProp<Stable>()("horse"));
const horseLegsL = horseL.compose(Lens.fromProp<Horse>()("numberOfLegs"));
const horseNameL = horseL.compose(Lens.fromProp<Horse>()("name"));

const horseTailL = horseL.compose(Lens.fromProp<Horse>()("hasTail"));
const horseAgeL = horseL.compose(Lens.fromProp<Horse>()("age"));

type Horse = {
  name: string;
  age: number;
  numberOfLegs: number;
  hasTail: boolean;
};

export type Stable = {
  postcode: string;
  owner: Owner | null;
  horse: Horse;
};

export type Owner = {
  name: string;
  age: number;
};

export type Data = {
  timestamp: number;
  stable: Stable;
};

export type Response = {
  statusCode: 201 | 400 | 500;
  data: Data;
};

export const sampleResponse: Response = {
  statusCode: 201,
  data: {
    timestamp: 100,
    stable: {
      postcode: "N1 1SL",
      owner: {
        name: "Ultimate Steve",
        age: 1000
      },
      horse: {
        name: "CHAMPION",
        age: 10,
        numberOfLegs: 3,
        hasTail: true
      }
    }
  }
};

// getters

// statusCode :: number
export const statusCode = statusCodeL.get(sampleResponse);

// timestamp: number
export const timestamp = timestampL.get(sampleResponse);

// postcode :: string
export const postcode = postcodeL.get(sampleResponse);

// horseLegs :: number
export const horseLegs = horseLegsL.get(sampleResponse);

// horseName :: string
export const horseName = horseNameL.get(sampleResponse);

// setters

// responseWith400StatusCode :: Response
export const responseWith400StatusCode = statusCodeL.set(400)(sampleResponse);

// responseWithRemovedTail :: Response
export const responseWithRemovedTail = horseTailL.set(false)(sampleResponse);

// responseWithAdditionalLeg :: Response
export const responseWithAdditionalLeg = horseLegsL.set(4)(sampleResponse);

// over

// horseBirthday :: Response -> Response
export const horseBirthday = horseAgeL.modify(a => a + 1);

// mapHorse :: (Horse -> Horse) -> Response -> Response
export const mapHorse = (f: (a: Horse) => Horse, resp: Response): Response =>
  horseL.modify(f)(resp);
