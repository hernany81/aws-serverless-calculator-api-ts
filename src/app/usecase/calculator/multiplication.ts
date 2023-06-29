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

interface MultiplicationService {
  execute(
    input: TwoParamsCalculatorOperation
  ): Promise<CalculatorOperationResult>;
}

class Multiplication
  extends CalculatorOperation
  implements MultiplicationService
{
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
    logger.info("Enter Multiplication.execute", {
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
      OperationType.MULTIPLICATION,
      creditBalance
    );

    const output = decInput1.mul(decInput2).toString();

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

    logger.info("Exit Multiplication.execute -> ", { ...result });

    return result;
  }
}

export { Multiplication, MultiplicationService };
