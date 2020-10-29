import {
  first,
  second,
  third,
  fourth,
  fifth,
  sixth
} from "../lesson8-task-either";

import { getOrElseW, isLeft } from "fp-ts/lib/Either";

describe("Task Either", () => {
  it("Get 200 as intended", async () => {
    const either = await first();
    const result = getOrElseW(_ => null)(either);
    expect(result && result.data.code).toEqual(200);
  });
  it("Also gets 200 as intended", async () => {
    const either = await second();
    const result = getOrElseW(_ => null)(either);
    expect(result && result.code).toEqual(200);
  });
  it("Gets a UserError as intended", async () => {
    const either = await third();
    const result = isLeft(either) ? either.left : null;
    expect(result && result.statusCode).toEqual(400);
    expect(result && result.type).toEqual("UserError");
  });
  it("Succeeds or gets a UserError", async () => {
    const either = await fourth();
    if (isLeft(either)) {
      expect(either.left.type).toEqual("UserError");
    } else {
      expect(either.right.code).toEqual(200);
    }
  });
  it("Succeeds or gets a UserError with limits", async () => {
    const either = await fifth();

    if (isLeft(either)) {
      expect(
        ["UserError", "TooManyAttempts"].includes(either.left.type)
      ).toBeTruthy();
    } else {
      expect(either.right.code).toEqual(200);
    }
  });
  it("Succeeds or gets a UserError with exponential backoff ", async () => {
    const either = await sixth();
    if (isLeft(either)) {
      expect(
        ["UserError", "TooManyAttempts"].includes(either.left.type)
      ).toBeTruthy();
    } else {
      expect(either.right.code).toEqual(200);
    }
  });
});
