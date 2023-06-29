import { OperationRecordId } from "@app/entity/operationRecord";
import { DefaultDeleteOperationRecordService } from "@app/usecase/operationrecord/delete";
import { getOperationRecordRepositoryMock } from "../../../app/appMocks";

describe("DefaultDeleteOperationRecordService", () => {
  test("", async () => {
    // arrange
    const operationRecordRepository = getOperationRecordRepositoryMock();
    const deleteOperationRecordService =
      new DefaultDeleteOperationRecordService(operationRecordRepository);
    const operationRecordId = OperationRecordId.for("operation-record-id");

    // act
    await deleteOperationRecordService.execute(operationRecordId);

    // assert
    expect(jest.mocked(operationRecordRepository.delete)).toHaveBeenCalledWith(
      operationRecordId
    );
  });
});
