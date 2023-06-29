import { DefaultListOperationRecordsService } from "@app/usecase/operationrecord/list";
import { getOperationRecordRepositoryMock } from "../../../app/appMocks";
import { createOperationRecord } from "../../../infra/utils/entityGenerator";
import { UserId } from "@app/entity/user";

describe("DefaultListOperationRecordsService", () => {
  test("Happy path", async () => {
    // arrange
    const operationRecordRepository = getOperationRecordRepositoryMock();
    const listOperationRecordService = new DefaultListOperationRecordsService(
      operationRecordRepository
    );

    jest.mocked(operationRecordRepository.list).mockResolvedValue({
      pageNumber: 1,
      pageSize: 15,
      totalResults: 1,
      totalPages: 1,
      result: [createOperationRecord()],
    });

    // act
    await listOperationRecordService.execute({
      pageNumber: 1,
      pageSize: 15,
      sortField: "createdDate",
      sortOrder: "asc",
      userId: UserId.for("user-id"),
    });

    // assert
    expect(jest.mocked(operationRecordRepository.list)).toHaveBeenCalled();
  });
});
