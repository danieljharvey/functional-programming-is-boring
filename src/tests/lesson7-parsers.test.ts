import {
  bulbEmailParser,
  msnParser,
  runParser,
  nothing,
  just
} from "../lesson7-parsers";

describe("Lesson 7 - parsers", () => {
  describe("Email parser", () => {
    it("Fail on nonsense", () => {
      expect(runParser(bulbEmailParser, "dfgjkldfgjdfjlkg")).toEqual(
        nothing()
      );
    });
    it("Finds a UK email", () => {
      expect(runParser(bulbEmailParser, "bobbydavehead@bulb.co.uk")).toEqual(
        just({ name: "bobbydavehead", country: "UK" })
      );
    });

    it("Finds a Spanish email", () => {
      expect(runParser(bulbEmailParser, "salvadordali@bulb.es")).toEqual(
        just({ name: "salvadordali", country: "SPAIN" })
      );
    });
    it("Finds a French email", () => {
      expect(runParser(bulbEmailParser, "jacquesbrel@bulb.fr")).toEqual(
        just({ name: "jacquesbrel", country: "FRANCE" })
      );
    });
    it("Finds an American email", () => {
      expect(runParser(bulbEmailParser, "billmurray@bulb.com")).toEqual(
        just({ name: "billmurray", country: "USA" })
      );
    });
    it("Rejects a nearly correct email", () => {
      expect(runParser(bulbEmailParser, "bruce@bolb.co.uk")).toEqual(
        nothing()
      );
    });
  });
  describe("MSN parser", () => {
    it("Fail on nonsense", () => {
      expect(runParser(msnParser, "dfgjkldfgjdfjlkg")).toEqual(nothing());
    });
    it("Too many year numbers", () => {
      expect(runParser(msnParser, "D961BL123456")).toEqual(nothing());
    });
    it("Too many batch numbers", () => {
      expect(runParser(msnParser, "D96BL1123456")).toEqual(nothing());
    });
    it("Too few batch numbers", () => {
      expect(runParser(msnParser, "D96BL12345")).toEqual(nothing());
    });

    it("Identifies a meter", () => {
      expect(runParser(msnParser, "D96BL123456")).toEqual(
        just({
          manufacturer: "Landis+Gyr",
          year: 96,
          batchNumber: 123456,
          purchasingCompany: "BL"
        })
      );
    });
    it("Identifies another meter", () => {
      expect(runParser(msnParser, "H20BL123456")).toEqual(
        just({
          manufacturer: "Secure",
          year: 20,
          batchNumber: 123456,
          purchasingCompany: "BL"
        })
      );
    });
  });
});
