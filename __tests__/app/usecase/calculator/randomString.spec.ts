import { UserId } from "@app/entity/user";
import {
  getDateProviderMock,
  getNumberConversionMock,
  getOperationRecordRepositoryMock,
  getOperationRepositoryMock,
  getUserRepositoryMock,
} from "../../appMocks";
import { randomUUID } from "crypto";
import { Operation, OperationId, OperationType } from "@app/entity/operation";
import { getRandomStringClientMock } from "../../../infra/infraMocks";
import { RandomString } from "@app/usecase/calculator/randomString";
import * as unitOfWorkApi from "@infra/utils/unitOfWork";

jest.mock<Partial<typeof unitOfWorkApi>>("@infra/utils/unitOfWork", () => {
  return {
    runWithinUnitOfWork: jest.fn((callback) => callback()),
  };
});

describe("Random string operation", () => {
  // arrange
  const operationRepository = getOperationRepositoryMock();
  const operationRecordRepository = getOperationRecordRepositoryMock();
  const userRepository = getUserRepositoryMock();
  const dateProvider = getDateProviderMock();
  const numberConversion = getNumberConversionMock();
  const randomStringClient = getRandomStringClientMock();
  const randomString = new RandomString(
    randomStringClient,
    operationRepository,
    operationRecordRepository,
    userRepository,
    dateProvider,
    numberConversion
  );
  const findByOperationTypeMock = jest.mocked(
    operationRepository.findByOperationType
  );
  const saveOperationRecordMock = jest.mocked(operationRecordRepository.save);
  const getTimestampMock = jest.mocked(dateProvider.now);
  const generateRandomStringCallMock = jest.mocked(randomStringClient.generate);
  const updateUserBalanceMock = jest.mocked(userRepository.updateUserBalance);

  test("Happy path", async () => {
    // arrange
    const userId = UserId.for(randomUUID());
    const creditBalance = 100;
    const operationId = OperationId.for(randomUUID());
    const operationCost = 33.5;
    const operation = Operation.for({
      id: operationId,
      type: OperationType.RANDOM_STRING,
      cost: operationCost,
    });
    const timestamp = new Date("2023-06-18T10:33:22");

    findByOperationTypeMock.mockResolvedValue(operation);
    getTimestampMock.mockReturnValue(timestamp);
    updateUserBalanceMock.mockResolvedValue(creditBalance - operationCost);

    // act
    const result = await randomString.execute({
      userId,
      creditBalance,
    });

    // assert
    const newCreditBalance = creditBalance - operationCost;

    expect(result).toEqual({
      result: "this-is-a-random-string",
      creditBalance: newCreditBalance,
    });
    expect(findByOperationTypeMock).toHaveBeenCalledWith(
      OperationType.RANDOM_STRING
    );
    expect(generateRandomStringCallMock).toHaveBeenCalled();
    expect(saveOperationRecordMock).toHaveBeenCalled();
    const savedOperationRecord = saveOperationRecordMock.mock.calls[0][0];
    expect(savedOperationRecord.operationId).toBe(operationId);
    expect(savedOperationRecord.type).toBe(OperationType.RANDOM_STRING);
    expect(savedOperationRecord.userId).toBe(userId);
    expect(savedOperationRecord.cost).toBe(operationCost);
    expect(savedOperationRecord.userBalance).toBe(newCreditBalance);
    expect(savedOperationRecord.operationInput).toEqual([]);
    expect(savedOperationRecord.operationResult).toBe(
      "this-is-a-random-string"
    );
    expect(savedOperationRecord.createdAt).toBe(timestamp);
    expect(updateUserBalanceMock).toHaveBeenCalledWith(userId, operation);
  });

  test("Insufficient balance error", async () => {
    // arrange
    findByOperationTypeMock.mockResolvedValue(
      Operation.for({
        id: OperationId.for(randomUUID()),
        type: OperationType.RANDOM_STRING,
        cost: 33.5,
      })
    );

    // act & assert
    await expect(
      randomString.execute({
        userId: UserId.for(randomUUID()),
        creditBalance: 10,
      })
    ).rejects.toThrow(
      /insufficient balance \(10\) to perform operation \(33\.5\)/i
    );
  });

  test("Operation is performed in a unit of work", async () => {
    // arrange
    findByOperationTypeMock.mockResolvedValue(
      Operation.for({
        id: OperationId.for(randomUUID()),
        type: OperationType.RANDOM_STRING,
        cost: 3.5,
      })
    );

    // act
    await randomString.execute({
      userId: UserId.for(randomUUID()),
      creditBalance: 10,
    });

    // assert
    expect(jest.mocked(unitOfWorkApi.runWithinUnitOfWork)).toHaveBeenCalled();
  });
});
