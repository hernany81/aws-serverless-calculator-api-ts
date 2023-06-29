import {
  DateProvider,
  NoParamsCalculatorOperation,
  NumberConversion,
} from "@app/utils/common";
import { CalculatorOperation, CalculatorOperationResult } from "./calculator";
import { OperationRepository } from "@app/repository/operationRepository";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { OperationType } from "@app/entity/operation";
import { UserRepository } from "@app/repository/userRepository";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

interface RandomStringService {
  execute(
    input: NoParamsCalculatorOperation
  ): Promise<CalculatorOperationResult>;
}

class RandomString extends CalculatorOperation implements RandomStringService {
  constructor(
    private readonly randomStringClient: RandomStringClient,
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
  }: NoParamsCalculatorOperation): Promise<CalculatorOperationResult> {
    logger.info("Enter RandomString.execute", { userId, creditBalance });
    const operation = await this.getOperationAndCheckBalance(
      OperationType.RANDOM_STRING,
      creditBalance
    );

    const output = await this.randomStringClient.generate();

    const newCreditBalance = await this.recordOperationAndUpdateUserBalance(
      userId,
      operation,
      [],
      output
    );

    const result: CalculatorOperationResult = {
      result: output,
      creditBalance: newCreditBalance,
    };

    logger.info("Exit RandomString.execute -> ", { ...result });

    return result;
  }
}

export { RandomStringService, RandomString };
