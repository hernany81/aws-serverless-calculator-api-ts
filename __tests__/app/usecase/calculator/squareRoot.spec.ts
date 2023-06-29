import { Operation, OperationId, OperationType } from "@app/entity/operation";
import { UserId } from "@app/entity/user";
import { SquareRoot } from "@app/usecase/calculator/squareRoot";
import * as unitOfWorkApi from "@infra/utils/unitOfWork";
import { randomUUID } from "crypto";
import Decimal from "decimal.js";
import {
  getDateProviderMock,
  getNumberConversionMock,
  getOperationRecordRepositoryMock,
  getOperationRepositoryMock,
  getUserRepositoryMock,
} from "../../appMocks";

jest.mock<Partial<typeof unitOfWorkApi>>("@infra/utils/unitOfWork", () => {
  return {
    runWithinUnitOfWork: jest.fn((callback) => callback()),
  };
});

describe("Square root operation", () => {
  // arrange
  const operationRepository = getOperationRepositoryMock();
  const operationRecordRepository = getOperationRecordRepositoryMock();
  const userRepository = getUserRepositoryMock();
  const dateProvider = getDateProviderMock();
  const numberConversion = getNumberConversionMock();
  const squareRoot = new SquareRoot(
    operationRepository,
    operationRecordRepository,
    userRepository,
    dateProvider,
    numberConversion
  );
  const getDecimalsMock = jest.mocked(numberConversion.getDecimals);
  const findByOperationTypeMock = jest.mocked(
    operationRepository.findByOperationType
  );
  const saveOperationRecordMock = jest.mocked(operationRecordRepository.save);
  const getTimestampMock = jest.mocked(dateProvider.now);
  const updateUserBalanceMock = jest.mocked(userRepository.updateUserBalance);

  test("Happy path", async () => {
    // arrange
    const userId = UserId.for(randomUUID());
    const creditBalance = 100;
    const input1 = "9";
    const operationId = OperationId.for(randomUUID());
    const operationCost = 33.5;
    const operation = Operation.for({
      id: operationId,
      type: OperationType.SQUARE_ROOT,
      cost: operationCost,
    });
    const timestamp = new Date("2023-06-18T10:33:22");

    getDecimalsMock.mockReturnValue([new Decimal("9")]);
    findByOperationTypeMock.mockResolvedValue(operation);
    getTimestampMock.mockReturnValue(timestamp);
    updateUserBalanceMock.mockResolvedValue(creditBalance - operationCost);

    // act
    const result = await squareRoot.execute({
      userId,
      creditBalance,
      input1,
    });

    // assert
    const newCreditBalance = creditBalance - operationCost;

    expect(result).toEqual({
      result: "3",
      creditBalance: newCreditBalance,
    });
    expect(getDecimalsMock).toHaveBeenCalledWith(input1);
    expect(findByOperationTypeMock).toHaveBeenCalledWith(
      OperationType.SQUARE_ROOT
    );
    expect(saveOperationRecordMock).toHaveBeenCalled();
    const savedOperationRecord = saveOperationRecordMock.mock.calls[0][0];
    expect(savedOperationRecord.operationId).toBe(operationId);
    expect(savedOperationRecord.type).toBe(OperationType.SQUARE_ROOT);
    expect(savedOperationRecord.userId).toBe(userId);
    expect(savedOperationRecord.cost).toBe(operationCost);
    expect(savedOperationRecord.userBalance).toBe(newCreditBalance);
    expect(savedOperationRecord.operationInput).toEqual([input1]);
    expect(savedOperationRecord.operationResult).toBe("3");
    expect(savedOperationRecord.createdAt).toBe(timestamp);
    expect(updateUserBalanceMock).toHaveBeenCalledWith(userId, operation);
  });

  test("Insufficient balance error", async () => {
    // arrange
    getDecimalsMock.mockReturnValue([new Decimal("1.5"), new Decimal("0.333")]);
    findByOperationTypeMock.mockResolvedValue(
      Operation.for({
        id: OperationId.for(randomUUID()),
        type: OperationType.SQUARE_ROOT,
        cost: 33.5,
      })
    );

    // act & assert
    await expect(
      squareRoot.execute({
        userId: UserId.for(randomUUID()),
        creditBalance: 10,
        input1: "8",
      })
    ).rejects.toThrow(
      /insufficient balance \(10\) to perform operation \(33\.5\)/i
    );
  });

  test("Operation is performed in a unit of work", async () => {
    // arrange
    getDecimalsMock.mockReturnValue([new Decimal("1.5"), new Decimal("0.333")]);
    findByOperationTypeMock.mockResolvedValue(
      Operation.for({
        id: OperationId.for(randomUUID()),
        type: OperationType.ADDITION,
        cost: 3.5,
      })
    );

    // act
    await squareRoot.execute({
      userId: UserId.for(randomUUID()),
      creditBalance: 10,
      input1: "8",
    });

    // assert
    expect(jest.mocked(unitOfWorkApi.runWithinUnitOfWork)).toHaveBeenCalled();
  });
});
