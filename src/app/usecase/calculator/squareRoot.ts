import {
  DateProvider,
  NumberConversion,
  OneParamCalculatorOperation,
} from "@app/utils/common";
import { CalculatorOperation, CalculatorOperationResult } from "./calculator";
import { OperationRepository } from "@app/repository/operationRepository";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { OperationType } from "@app/entity/operation";
import { UserRepository } from "@app/repository/userRepository";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

interface SquareRootService {
  execute(
    input: OneParamCalculatorOperation
  ): Promise<CalculatorOperationResult>;
}

class SquareRoot extends CalculatorOperation implements SquareRootService {
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
  }: OneParamCalculatorOperation): Promise<CalculatorOperationResult> {
    logger.info("Enter SquareRoot.execute", { userId, creditBalance, input1 });
    const [decInput1] = this.numberConversion.getDecimals(input1);

    const operation = await this.getOperationAndCheckBalance(
      OperationType.SQUARE_ROOT,
      creditBalance
    );

    const output = decInput1.sqrt().toString();

    const newCreditBalance = await this.recordOperationAndUpdateUserBalance(
      userId,
      operation,
      [input1],
      output
    );

    const result: CalculatorOperationResult = {
      result: output,
      creditBalance: newCreditBalance,
    };

    logger.info("Exit SquareRoot.execute -> ", { ...result });
    return result;
  }
}

export { SquareRootService, SquareRoot };
