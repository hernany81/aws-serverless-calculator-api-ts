import { OperationType } from "@app/entity/operation";
import { OperationRecord } from "@app/entity/operationRecord";
import { UserId } from "@app/entity/user";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

type ListOperationRecordSortableFields = "type" | "result" | "createdDate";
type SortingOrder = "asc" | "desc";
type PaginationParam = {
  pageNumber: number;
  pageSize: number;
};

type PaginatedResult<T> = PaginationParam & {
  totalResults: number;
  totalPages: number;
  result: T[];
};

type ListOperationRecordsParams = PaginationParam & {
  sortField: ListOperationRecordSortableFields;
  sortOrder: SortingOrder;
  userId: UserId;
  operationType?: OperationType;
  inputContains?: string;
  outputContains?: string;
};

interface ListOperationRecordsService {
  execute(
    listParams: ListOperationRecordsParams
  ): Promise<PaginatedResult<OperationRecord>>;
}

class DefaultListOperationRecordsService
  implements ListOperationRecordsService
{
  constructor(
    private readonly operationRecordsRepository: OperationRecordRepository
  ) {}

  async execute(
    listParams: ListOperationRecordsParams
  ): Promise<PaginatedResult<OperationRecord>> {
    logger.info("Enter DefaultListOperationRecordsService.execute", {
      listParams,
    });
    const result = this.operationRecordsRepository.list(listParams);
    logger.info("Exit DefaultListOperationRecordsService.execute -> ", {
      result: { ...result, result: `${(await result).result.length} item(s)` },
    });
    return result;
  }
}

export {
  DefaultListOperationRecordsService,
  ListOperationRecordSortableFields,
  ListOperationRecordsParams,
  ListOperationRecordsService,
  PaginatedResult,
  SortingOrder,
};
