import { OperationType } from "@app/entity/operation";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { OperationRepository } from "@app/repository/operationRepository";
import { UserRepository } from "@app/repository/userRepository";
import {
  DateProvider,
  NumberConversion,
  TwoParamsCalculatorOperation,
} from "@app/utils/common";
import { applicationLogger } from "@infra/utils/logging";
import { CalculatorOperation, CalculatorOperationResult } from "./calculator";

const logger = applicationLogger;

interface SubtractionService {
  execute(
    input: TwoParamsCalculatorOperation
  ): Promise<CalculatorOperationResult>;
}

class Subtraction extends CalculatorOperation implements SubtractionService {
  constructor(
    operationRepository: OperationRepository,
    operationRecordRepository: OperationRecordRepository,
    userRepository: UserRepository,
    dateProvider: DateProvider,
    numberConversion: NumberConversion
  ) {
    super(
      operationRepository,
      operationRecordRepository,
      userRepository,
      dateProvider,
      numberConversion
    );
  }

  async execute({
    userId,
    creditBalance,
    input1,
    input2,
  }: TwoParamsCalculatorOperation): Promise<CalculatorOperationResult> {
    logger.info("Enter Subtraction.execute", {
      userId,
      creditBalance,
      input1,
      input2,
    });
    const [decInput1, decInput2] = this.numberConversion.getDecimals(
      input1,
      input2
    );

    const operation = await this.getOperationAndCheckBalance(
      OperationType.SUBTRACTION,
      creditBalance
    );

    const output = decInput1.sub(decInput2).toString();

    const newCreditBalance = await this.recordOperationAndUpdateUserBalance(
      userId,
      operation,
      [input1, input2],
      output
    );

    const result: CalculatorOperationResult = {
      result: output,
      creditBalance: newCreditBalance,
    };

    logger.info("Exit Subtraction.execute", { ...result });
    return result;
  }
}

export { Subtraction, SubtractionService };
