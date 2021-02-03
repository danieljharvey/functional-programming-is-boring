import { Lens } from "monocle-ts";

const statusCodeL = Lens.fromProp<Response>()("statusCode");
const dataL = Lens.fromProp<Response>()("data");

// const timestampL = dataL.compose(Lens.fromProp<Data>()("timestamp"));

export type Horse = {
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
export const timestamp = undefined as any;

// postcode :: string
export const postcode = undefined as any;

// horseLegs :: number
export const horseLegs = undefined as any;

// horseName :: string
export const horseName = undefined as any;

// setters

// responseWith400StatusCode :: Response
export const responseWith400StatusCode = undefined as any;

// responseWithRemovedTail :: Response
export const responseWithRemovedTail = undefined as any;

// responseWithAdditionalLeg :: Response
export const responseWithAdditionalLeg = undefined as any;

// over

// horseBirthday :: Response -> Response
export const horseBirthday = undefined as any;

// mapHorse :: (Horse -> Horse) -> Response -> Response
export const mapHorse = undefined as any;
