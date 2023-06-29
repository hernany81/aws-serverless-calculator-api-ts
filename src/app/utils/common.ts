import Decimal from "decimal.js";
import { UserId } from "../entity/user";

// TODO: See to break down this file?

/**
 * Parameter types for the operations
 */

type NoParamsCalculatorOperation = { userId: UserId; creditBalance: number };
type OneParamCalculatorOperation = NoParamsCalculatorOperation & {
  input1: string;
};
type TwoParamsCalculatorOperation = OneParamCalculatorOperation & {
  input2: string;
};

/**
 * Errors
 */
abstract class ApplicationError extends Error {
  constructor(
    readonly errorName: string,
    message?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}
class InsufficientBalanceError extends ApplicationError {
  constructor(message?: string, options?: ErrorOptions) {
    super("InsufficientBalanceError", message, options);
  }
}
class InvalidDataFormat extends ApplicationError {
  constructor(message?: string, options?: ErrorOptions) {
    super("InvalidDataFormat", message, options);
  }
}

/**
 * Other
 */
interface DateProvider {
  now(): Date;
}

class DefaultDateProvider implements DateProvider {
  now(): Date {
    return new Date();
  }
}

interface NumberConversion {
  getDecimals(...strNumbers: string[]): Decimal[];
}

class DefaultNumberConversion implements NumberConversion {
  getDecimals(...strNumbers: string[]): Decimal[] {
    return strNumbers.map((str) => {
      try {
        return new Decimal(str);
      } catch (err: any) {
        throw new InvalidDataFormat(`${str} is not a valid number`, {
          cause: err,
        });
      }
    });
  }
}

export {
  DateProvider,
  DefaultDateProvider,
  DefaultNumberConversion,
  ApplicationError,
  InsufficientBalanceError,
  InvalidDataFormat,
  NoParamsCalculatorOperation,
  NumberConversion,
  OneParamCalculatorOperation,
  TwoParamsCalculatorOperation,
};
