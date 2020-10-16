import {
  statusCode,
  timestamp,
  postcode,
  horseLegs,
  horseName,
  responseWith400StatusCode,
  responseWithRemovedTail,
  responseWithAdditionalLeg,
  horseBirthday,
  mapHorse,
  sampleResponse
} from "../lesson6-optics";

describe("Lesson 6 - optics", () => {
  describe("Get", () => {
    it("Gets the status code", () => {
      expect(statusCode).toEqual(201);
    });
    it("Gets the timestamp", () => {
      expect(timestamp).toEqual(100);
    });
    it("Gets the postcode", () => {
      expect(postcode).toEqual("N1 1SL");
    });
    it("Gets the number of horse legs", () => {
      expect(horseLegs).toEqual(3);
    });
    it("Gets the horse name", () => {
      expect(horseName).toEqual("CHAMPION");
    });
  });
  describe("Set", () => {
    it("Sets the status code to 400", () => {
      expect(responseWith400StatusCode).toEqual({
        ...sampleResponse,
        statusCode: 400
      });
    });
    it("Removes the tail from the horse", () => {
      expect(responseWithRemovedTail).toEqual({
        ...sampleResponse,
        data: {
          ...sampleResponse.data,
          stable: {
            ...sampleResponse.data.stable,
            horse: {
              ...sampleResponse.data.stable.horse,
              hasTail: false
            }
          }
        }
      });
    });
    it("Adds an additional leg to the horse", () => {
      expect(responseWithAdditionalLeg).toEqual({
        ...sampleResponse,
        data: {
          ...sampleResponse.data,
          stable: {
            ...sampleResponse.data.stable,
            horse: {
              ...sampleResponse.data.stable.horse,
              numberOfLegs: 4
            }
          }
        }
      });
    });
  });
  describe("Modify", () => {
    it("Happy birthday horse", () => {
      const response = horseBirthday(sampleResponse);
      expect(response).toEqual({
        ...sampleResponse,
        data: {
          ...sampleResponse.data,
          stable: {
            ...sampleResponse.data.stable,
            horse: {
              ...sampleResponse.data.stable.horse,
              age: 11
            }
          }
        }
      });
    });
    it("Creates a horse mapping function", () => {
      const response = mapHorse(
        horse => ({ ...horse, age: horse.age + 1 }),
        sampleResponse
      );
      expect(response).toEqual({
        ...sampleResponse,
        data: {
          ...sampleResponse.data,
          stable: {
            ...sampleResponse.data.stable,
            horse: {
              ...sampleResponse.data.stable.horse,
              age: 11
            }
          }
        }
      });
    });
  });
});
