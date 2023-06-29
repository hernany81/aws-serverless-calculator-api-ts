import {
  DefaultDateProvider,
  DefaultNumberConversion,
} from "@app/utils/common";
import Decimal from "decimal.js";

describe("DefaultDateProvider", () => {
  test("Current date is returned", () => {
    // arrange
    const dateProvider = new DefaultDateProvider();

    // act
    const val = dateProvider.now();
    const now = new Date();

    // assert
    expect(val).toBeInstanceOf(Date);
    expect(val.getTime()).toBeCloseTo(now.getTime(), 100);
  });
});

describe("DefaultNumberConversion", () => {
  const numberConversion = new DefaultNumberConversion();

  test("Numbers parsed successfully", () => {
    // arrange
    // act
    const [input1, input2] = numberConversion.getDecimals(
      "3.123456789",
      "5e-15"
    );

    // assert
    expect(input1).toEqual(new Decimal(3.123456789));
    expect(input2).toEqual(new Decimal(0.000000000000005));
  });

  test("Bad number format", () => {
    // arrange
    // act & assert
    expect(() => {
      numberConversion.getDecimals("3.4.5");
    }).toThrow(/3\.4\.5 is not a valid number/i);
  });
});
