import { Operation, OperationId, OperationType } from "@app/entity/operation";
import { UserId } from "@app/entity/user";
import { Multiplication } from "@app/usecase/calculator/multiplication";
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

describe("Multiplication operation", () => {
  // arrange
  const operationRepository = getOperationRepositoryMock();
  const operationRecordRepository = getOperationRecordRepositoryMock();
  const userRepository = getUserRepositoryMock();
  const dateProvider = getDateProviderMock();
  const numberConversion = getNumberConversionMock();
  const multiplication = new Multiplication(
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
    const input1 = "1.23456789";
    const input2 = "0.987654321";
    const operationId = OperationId.for(randomUUID());
    const operationCost = 33.5;
    const operation = Operation.for({
      id: operationId,
      type: OperationType.MULTIPLICATION,
      cost: operationCost,
    });
    const timestamp = new Date("2023-06-18T10:33:22");

    getDecimalsMock.mockReturnValue([new Decimal("1.5"), new Decimal("2")]);
    findByOperationTypeMock.mockResolvedValue(operation);
    getTimestampMock.mockReturnValue(timestamp);
    updateUserBalanceMock.mockResolvedValue(creditBalance - operationCost);

    // act
    const newCreditBalance = creditBalance - operationCost;

    const result = await multiplication.execute({
      userId,
      creditBalance,
      input1,
      input2,
    });

    // assert
    expect(result).toEqual({
      result: "3",
      creditBalance: newCreditBalance,
    });
    expect(getDecimalsMock).toHaveBeenCalledWith(input1, input2);
    expect(findByOperationTypeMock).toHaveBeenCalledWith(
      OperationType.MULTIPLICATION
    );
    expect(saveOperationRecordMock).toHaveBeenCalled();
    const savedOperationRecord = saveOperationRecordMock.mock.calls[0][0];
    expect(savedOperationRecord.operationId).toBe(operationId);
    expect(savedOperationRecord.type).toBe(OperationType.MULTIPLICATION);
    expect(savedOperationRecord.userId).toBe(userId);
    expect(savedOperationRecord.cost).toBe(operationCost);
    expect(savedOperationRecord.userBalance).toBe(newCreditBalance);
    expect(savedOperationRecord.operationInput).toEqual([input1, input2]);
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
        type: OperationType.MULTIPLICATION,
        cost: 33.5,
      })
    );

    // act & assert
    await expect(
      multiplication.execute({
        userId: UserId.for(randomUUID()),
        creditBalance: 10,
        input1: "1.23456789",
        input2: "0.987654321",
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
        type: OperationType.MULTIPLICATION,
        cost: 3.5,
      })
    );

    // act
    await multiplication.execute({
      userId: UserId.for(randomUUID()),
      creditBalance: 10,
      input1: "1.23456789",
      input2: "0.987654321",
    });

    // assert
    expect(jest.mocked(unitOfWorkApi.runWithinUnitOfWork)).toHaveBeenCalled();
  });
});
