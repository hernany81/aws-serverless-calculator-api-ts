import { Operation, OperationType } from "@app/entity/operation";
import { UserId } from "@app/entity/user";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { OperationRepository } from "@app/repository/operationRepository";
import { UserRepository } from "@app/repository/userRepository";
import {
  DateProvider,
  InsufficientBalanceError,
  NumberConversion,
} from "@app/utils/common";
import { applicationLogger } from "@infra/utils/logging";
import { runWithinUnitOfWork } from "@infra/utils/unitOfWork";

const logger = applicationLogger;

interface CalculatorOperationResult {
  result: string;
  creditBalance: number;
}

abstract class CalculatorOperation {
  constructor(
    protected readonly operationRepository: OperationRepository,
    protected readonly operationRecordRepository: OperationRecordRepository,
    protected readonly userRepository: UserRepository,
    protected readonly dateProvider: DateProvider,
    protected readonly numberConversion: NumberConversion
  ) {}

  protected async getOperationAndCheckBalance(
    operationType: OperationType,
    creditBalance: number
  ): Promise<Operation> {
    logger.info("Enter CalculatorOperation.getOperationAndCheckBalance", {
      operationType,
      creditBalance,
    });
    const operation = await this.operationRepository.findByOperationType(
      operationType
    );

    if (operation.cost > creditBalance) {
      throw new InsufficientBalanceError(
        `Insufficient balance (${creditBalance}) to perform operation (${operation.cost})`
      );
    }

    logger.info("Exit CalculatorOperation.getOperationAndCheckBalance", {
      operation,
    });

    return operation;
  }

  protected async recordOperationAndUpdateUserBalance(
    userId: UserId,
    operation: Operation,
    input: string[],
    result: string
  ): Promise<number> {
    logger.info(
      "Enter CalculatorOperation.recordOperationAndUpdateUserBalance",
      { userId, operation, input, result }
    );
    let newBalance: number;

    await runWithinUnitOfWork(async () => {
      newBalance = await this.userRepository.updateUserBalance(
        userId,
        operation
      );
      await this.operationRecordRepository.save({
        userId: userId,
        operationId: operation.id,
        type: operation.type,
        cost: operation.cost,
        userBalance: newBalance,
        operationInput: input,
        operationResult: result.toString(),
        createdAt: this.dateProvider.now(),
      });
    });

    logger.info("Exit CalculatorOperation.recordOperationAndUpdateUserBalance");

    return newBalance;
  }

  protected async updateUserBalance(
    userId: UserId,
    operation: Operation
  ): Promise<void> {
    logger.info("Enter CalculatorOperation.updateUserBalance", {
      userId,
      operation,
    });
    await this.userRepository.updateUserBalance(userId, operation);
    logger.info("Exit CalculatorOperation.updateUserBalance");
  }
}

export { CalculatorOperation, CalculatorOperationResult };
