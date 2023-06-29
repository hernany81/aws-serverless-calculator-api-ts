import { OperationType } from "@app/entity/operation";
import {
  OperationRecord,
  OperationRecordId,
} from "@app/entity/operationRecord";
import { ListOperationRecordsParams } from "@app/usecase/operationrecord/list";
import { DateProvider, DefaultDateProvider } from "@app/utils/common";
import { OperationRecord as OperationRecordModel } from "@infra/persistance/model/operationRecord";
import { DefaultOperationRecordRepository } from "@infra/repository/operationRecordRepository";
import * as unitOfWorkApi from "@infra/utils/unitOfWork";
import dayjs from "dayjs";
import { connectMongo, disconnectMongo } from "../utils/database";
import { createOperationRecord } from "../utils/entityGenerator";
import { UserId } from "@app/entity/user";

describe("DefaultOperationRecordRepository integration tests", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => await disconnectMongo());

  beforeEach(async () => {
    await OperationRecordModel.collection.deleteMany();
  });

  test("Save - successful", async () => {
    // arrange
    const operationRecordRepository = new DefaultOperationRecordRepository(
      new DefaultDateProvider()
    );

    // act
    const savedOperationRecordId = await operationRecordRepository.save(
      createOperationRecord()
    );

    // assert
    const savedRecord = await OperationRecordModel.findById(
      savedOperationRecordId.value
    ).exec();
    expect(savedRecord).toBeTruthy();
  });

  test("Save - invalid operation type", async () => {
    // arrange
    const operationRecordRepository = new DefaultOperationRecordRepository(
      new DefaultDateProvider()
    );

    // act & assert
    await expect(
      operationRecordRepository.save(
        createOperationRecord({ type: "BADD" as OperationType })
      )
    ).rejects.toThrow(/.*`BADD`.*not a valid enum.*/i);
  });

  test("Save calls the getSession to operate within a unit of work", async () => {
    // arrange
    const operationRecordRepository = new DefaultOperationRecordRepository(
      new DefaultDateProvider()
    );
    const getSessionSpy = jest.spyOn(unitOfWorkApi, "getSession");

    // act
    await operationRecordRepository.save(createOperationRecord());

    // assert
    expect(getSessionSpy).toHaveBeenCalled();
  });

  const dateCreated = dayjs("2023-06-16T11:30:00");
  const filterByParams: Array<{
    description: string;
    operationType?: OperationType;
    inputContains?: string;
    outputContains?: string;
    dateCreatedResults: dayjs.Dayjs[];
  }> = [
    {
      description: "operationType",
      operationType: OperationType.ADDITION,
      dateCreatedResults: [dateCreated],
    },
    {
      description: "operationType",
      operationType: OperationType.DIVISION,
      dateCreatedResults: [dateCreated.add(1, "second")],
    },
    {
      description: "operationType",
      operationType: OperationType.MULTIPLICATION,
      dateCreatedResults: [dateCreated.add(2, "second")],
    },
    {
      description: "operationType",
      operationType: OperationType.RANDOM_STRING,
      dateCreatedResults: [dateCreated.add(3, "second")],
    },
    {
      description: "operationType",
      operationType: OperationType.SQUARE_ROOT,
      dateCreatedResults: [dateCreated.add(4, "second")],
    },
    {
      description: "operationType",
      operationType: OperationType.SUBTRACTION,
      dateCreatedResults: [dateCreated.add(5, "second")],
    },
    {
      description: "inputContains",
      inputContains: ".1",
      dateCreatedResults: [dateCreated],
    },
    {
      description: "inputContains",
      inputContains: "4",
      dateCreatedResults: [
        dateCreated.add(4, "second"),
        dateCreated.add(5, "second"),
      ],
    },
    {
      description: "outputContains",
      outputContains: "1.",
      dateCreatedResults: [dateCreated, dateCreated.add(1, "second")],
    },
  ];

  test.each(filterByParams)(
    "Filter by $description [$#]",
    async ({
      operationType,
      inputContains,
      outputContains,
      dateCreatedResults,
    }) => {
      // arrange
      const operationRecordRepository = new DefaultOperationRecordRepository(
        new DefaultDateProvider()
      );
      const userId = UserId.for("6487d44a31ba91ba0a84424a");
      const recordsToCreate = [
        createOperationRecord({
          type: OperationType.ADDITION,
          operationInput: ["1", "0.1"],
          operationResult: "1.1",
          createdAt: dateCreated.toDate(),
          userId,
        }),
        createOperationRecord({
          type: OperationType.DIVISION,
          operationInput: ["3", "2"],
          operationResult: "1.5",
          createdAt: dateCreated.add(1, "second").toDate(),
          userId,
        }),
        createOperationRecord({
          type: OperationType.MULTIPLICATION,
          operationInput: ["3", "2"],
          operationResult: "6",
          createdAt: dateCreated.add(2, "second").toDate(),
          userId,
        }),
        createOperationRecord({
          type: OperationType.RANDOM_STRING,
          operationInput: [],
          operationResult: "ABCDEFGHI",
          createdAt: dateCreated.add(3, "second").toDate(),
          userId,
        }),
        createOperationRecord({
          type: OperationType.SQUARE_ROOT,
          operationInput: ["4"],
          operationResult: "2",
          createdAt: dateCreated.add(4, "second").toDate(),
          userId,
        }),
        createOperationRecord({
          type: OperationType.SUBTRACTION,
          operationInput: ["15", "4"],
          operationResult: "11",
          createdAt: dateCreated.add(5, "second").toDate(),
          userId,
        }),
      ];

      await Promise.all(
        recordsToCreate.map((x) => operationRecordRepository.save(x))
      );

      // act
      const results = await operationRecordRepository.list({
        operationType,
        inputContains,
        outputContains,
        pageNumber: 1,
        pageSize: 10,
        sortField: "createdDate",
        sortOrder: "asc",
        userId,
      });

      // assert
      expect(results.result.map((x) => x.createdAt)).toEqual(
        dateCreatedResults.map((x) => x.toDate())
      );
    }
  );

  const paginationParams: Array<{
    input: ListOperationRecordsParams;
    totalResults: number;
    totalPages: number;
    dateCreatedResults: dayjs.Dayjs[];
  }> = [
    {
      input: {
        pageNumber: 1,
        pageSize: 5,
        sortField: "createdDate",
        sortOrder: "asc",
        userId: UserId.for("6487d44a31ba91ba0a84424a"),
      },
      totalResults: 100,
      totalPages: 20,
      dateCreatedResults: [
        dateCreated,
        dateCreated.add(1, "second"),
        dateCreated.add(2, "second"),
        dateCreated.add(3, "second"),
        dateCreated.add(4, "second"),
      ],
    },
    {
      input: {
        pageNumber: 20,
        pageSize: 5,
        sortField: "createdDate",
        sortOrder: "asc",
        userId: UserId.for("6487d44a31ba91ba0a84424a"),
      },
      totalResults: 100,
      totalPages: 20,
      dateCreatedResults: [
        dateCreated.add(95, "second"),
        dateCreated.add(96, "second"),
        dateCreated.add(97, "second"),
        dateCreated.add(98, "second"),
        dateCreated.add(99, "second"),
      ],
    },
    {
      input: {
        pageNumber: 1,
        pageSize: 5,
        sortField: "type",
        sortOrder: "asc",
        userId: UserId.for("6487d44a31ba91ba0a84424a"),
      },
      totalResults: 100,
      totalPages: 20,
      dateCreatedResults: [
        dateCreated,
        dateCreated.add(6, "second"),
        dateCreated.add(12, "second"),
        dateCreated.add(18, "second"),
        dateCreated.add(24, "second"),
      ],
    },
    {
      input: {
        pageNumber: 1,
        pageSize: 5,
        sortField: "type",
        sortOrder: "desc",
        userId: UserId.for("6487d44a31ba91ba0a84424a"),
      },
      totalResults: 100,
      totalPages: 20,
      dateCreatedResults: [
        dateCreated.add(1, "second"),
        dateCreated.add(7, "second"),
        dateCreated.add(13, "second"),
        dateCreated.add(19, "second"),
        dateCreated.add(25, "second"),
      ],
    },
    {
      input: {
        operationType: OperationType.SQUARE_ROOT,
        pageNumber: 1,
        pageSize: 5,
        sortField: "result",
        sortOrder: "desc",
        userId: UserId.for("6487d44a31ba91ba0a84424a"),
      },
      totalResults: 16,
      totalPages: 4,
      dateCreatedResults: [
        dateCreated.add(94, "second"),
        dateCreated.add(88, "second"),
        dateCreated.add(82, "second"),
        dateCreated.add(76, "second"),
        dateCreated.add(70, "second"),
      ],
    },
  ];
  const operationTypeArray = Object.values(OperationType);

  test.each(paginationParams)(
    "Pagination [$#]",
    async ({ input, totalResults, totalPages, dateCreatedResults }) => {
      // arrange
      const operationRecordRepository = new DefaultOperationRecordRepository(
        new DefaultDateProvider()
      );

      const recordsToCreate: Array<OperationRecord> = [];

      for (let i = 0; i < 100; i++) {
        const opType = operationTypeArray[i % 6];
        const item = createOperationRecord({
          type: opType,
          operationResult: i.toString(),
          createdAt: dateCreated.add(i, "second").toDate(),
          userId: UserId.for("6487d44a31ba91ba0a84424a"),
        });
        recordsToCreate.push(item);
      }

      await Promise.all(
        recordsToCreate.map((x) => operationRecordRepository.save(x))
      );

      // act
      const results = await operationRecordRepository.list(input);

      // assert
      expect(results.pageNumber).toEqual(input.pageNumber);
      expect(results.totalResults).toEqual(totalResults);
      expect(results.totalPages).toEqual(totalPages);
      expect(results.result.map((x) => x.createdAt)).toEqual(
        dateCreatedResults.map((x) => x.toDate())
      );
    }
  );

  test("Soft delete an existing document", async () => {
    // arrange
    const dateProvider: DateProvider = {
      now: jest.fn(() => dayjs("2023-06-19T9:55:15").toDate()),
    };

    const operationRecordRepository = new DefaultOperationRecordRepository(
      dateProvider
    );
    const operationRecordId = await operationRecordRepository.save(
      createOperationRecord()
    );

    // act
    const deletedItemId = await operationRecordRepository.delete(
      operationRecordId
    );
    const loadedRecord = await OperationRecordModel.findById(
      operationRecordId.value
    );

    // assert
    expect(deletedItemId).toEqual(operationRecordId);
    expect(loadedRecord.deletedAt).toEqual(
      dayjs("2023-06-19T9:55:15").toDate()
    );
  });

  test("Soft delete a non-existing document", async () => {
    // arrange
    const dateProvider: DateProvider = {
      now: jest.fn(() => dayjs("2023-06-19T9:55:15").toDate()),
    };

    const operationRecordRepository = new DefaultOperationRecordRepository(
      dateProvider
    );
    const operationRecordId = OperationRecordId.for("649051401f710e064fa9b6f6");

    // act
    const deletedItemId = await operationRecordRepository.delete(
      operationRecordId
    );

    // assert
    expect(deletedItemId).toBeUndefined();
  });

  test("Soft deleted item is not listed", async () => {
    // arrange
    const dateProvider: DateProvider = {
      now: jest.fn(() => dayjs("2023-06-19T9:55:15").toDate()),
    };

    const userId = UserId.for("6487d44a31ba91ba0a84424a");

    const operationRecordRepository = new DefaultOperationRecordRepository(
      dateProvider
    );
    const operationRecordId = await operationRecordRepository.save(
      createOperationRecord({
        userId,
      })
    );

    // act
    await operationRecordRepository.delete(operationRecordId);
    const loadedRecords = await operationRecordRepository.list({
      pageNumber: 1,
      pageSize: 10,
      sortField: "createdDate",
      sortOrder: "asc",
      userId,
    });

    // assert
    expect(loadedRecords.totalResults).toEqual(0);
    expect(loadedRecords.totalPages).toEqual(1);
    expect(loadedRecords.result.length).toEqual(0);
  });
});
