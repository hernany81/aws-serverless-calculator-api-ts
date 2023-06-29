import { OperationType } from "../../entity/operation";
import { OperationRecordRepository } from "../../repository/operationRecordRepository";
import {
  DateProvider,
  NumberConversion,
  TwoParamsCalculatorOperation,
} from "../../utils/common";
import { OperationRepository } from "../../repository/operationRepository";
import { CalculatorOperation, CalculatorOperationResult } from "./calculator";
import { UserRepository } from "@app/repository/userRepository";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

interface AdditionService {
  execute(
    input: TwoParamsCalculatorOperation
  ): Promise<CalculatorOperationResult>;
}

class Addition extends CalculatorOperation implements AdditionService {
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
    logger.info("Enter Addition.execute", {
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
      OperationType.ADDITION,
      creditBalance
    );

    const output = decInput1.add(decInput2).toString();

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

    logger.info("Exit Addition.execute -> ", { ...result });

    return result;
  }
}

export { AdditionService, Addition };
