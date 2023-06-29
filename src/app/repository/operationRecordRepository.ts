import {
  ListOperationRecordSortableFields,
  ListOperationRecordsParams,
  PaginatedResult,
} from "@app/usecase/operationrecord/list";
import { OperationId } from "../entity/operation";
import { OperationRecord, OperationRecordId } from "../entity/operationRecord";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

interface OperationRecordRepository {
  save(operationRecord: Omit<OperationRecord, "id">): Promise<OperationId>;
  delete(id: OperationRecordId): Promise<OperationRecordId>;
  list(
    listParams: ListOperationRecordsParams
  ): Promise<PaginatedResult<OperationRecord>>;
}

const getDatabaseSortFieldName = (
  field: ListOperationRecordSortableFields
): string => {
  logger.debug("Enter getDatabaseSortFieldName", { field });
  let result: string;

  switch (field) {
    case "type":
      result = "type";
      break;
    case "result":
      result = "operationResult";
      break;
    case "createdDate":
      result = "createdAt";
      break;
  }
  logger.debug("Exit getDatabaseSortFieldName -> ", { result });
  return result;
};

export { OperationRecordRepository, PaginatedResult, getDatabaseSortFieldName };
