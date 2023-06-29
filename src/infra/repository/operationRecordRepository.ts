import { OperationId, OperationType } from "@app/entity/operation";
import {
  OperationRecord,
  OperationRecordId,
} from "@app/entity/operationRecord";
import { UserId } from "@app/entity/user";
import {
  OperationRecordRepository,
  PaginatedResult,
  getDatabaseSortFieldName,
} from "@app/repository/operationRecordRepository";
import { ListOperationRecordsParams } from "@app/usecase/operationrecord/list";
import { DateProvider } from "@app/utils/common";
import {
  OperationRecordDocument,
  OperationRecord as OperationRecordModel,
} from "@infra/persistance/model/operationRecord";
import { escapeRegex } from "@infra/utils/escape";
import { applicationLogger } from "@infra/utils/logging";
import { getSession } from "@infra/utils/unitOfWork";
import { FilterQuery, PaginateOptions } from "mongoose";

const logger = applicationLogger;

function mapFromOperationRecord(record: Omit<OperationRecord, "id">) {
  logger.debug("Enter mapFromOperationRecord", { record });
  const result = new OperationRecordModel({
    operationId: record.operationId.value,
    type: record.type,
    userId: record.userId.value,
    cost: record.cost,
    userBalance: record.userBalance,
    operationInput: record.operationInput,
    operationResult: record.operationResult,
    createdAt: record.createdAt,
  });
  logger.debug("Exit mapFromOperationRecord -> ", { result });
  return result;
}

function mapToOperationRecord(document: OperationRecordDocument) {
  logger.debug("Enter mapToOperationRecord", { document });
  const result = OperationRecord.for({
    id: OperationRecordId.for(document._id.toString()),
    operationId: OperationId.for(document.operationId.toString()),
    type: OperationType[document.type],
    userId: UserId.for(document.userId.toString()),
    cost: document.cost,
    userBalance: document.userBalance,
    operationInput: document.operationInput,
    operationResult: document.operationResult,
    createdAt: document.createdAt,
  });
  logger.debug("Exit mapToOperationRecord -> ", { result });
  return result;
}

class DefaultOperationRecordRepository implements OperationRecordRepository {
  constructor(private readonly dateProvider: DateProvider) {}

  async save(
    operationRecord: Omit<OperationRecord, "id">
  ): Promise<OperationRecordId> {
    logger.debug("Enter DefaultOperationRecordRepository.save", {
      operationRecord,
    });
    const recordModel = mapFromOperationRecord(operationRecord);
    const session = getSession();
    await recordModel.save({ session });
    const result = OperationRecordId.for(recordModel._id.toString());
    logger.debug("Exit DefaultOperationRecordRepository.save", {
      result,
    });
    return result;
  }

  async delete(id: OperationRecordId): Promise<OperationRecordId> {
    logger.debug("Enter DefaultOperationRecordRepository.delete", {
      id,
    });
    const deletedDoc = await OperationRecordModel.findByIdAndUpdate(id.value, {
      deletedAt: this.dateProvider.now(),
    });
    const result = deletedDoc?._id
      ? OperationRecordId.for(deletedDoc._id.toString())
      : undefined;
    logger.debug("Exit DefaultOperationRecordRepository.delete", {
      result,
    });
    return result;
  }

  async list(
    listParams: ListOperationRecordsParams
  ): Promise<PaginatedResult<OperationRecord>> {
    logger.debug("Enter DefaultOperationRecordRepository.list", {
      listParams,
    });
    const query: FilterQuery<OperationRecordDocument> = {
      userId: listParams.userId.value,
      deletedAt: null,
    };
    if (listParams.operationType) {
      query.type = listParams.operationType;
    }
    if (listParams.inputContains) {
      query.operationInput = {
        $regex: escapeRegex(listParams.inputContains),
      };
    }
    if (listParams.outputContains) {
      query.operationResult = {
        $regex: escapeRegex(listParams.outputContains),
      };
    }
    const sortField = getDatabaseSortFieldName(listParams.sortField);
    const sortComponent = [sortField, listParams.sortOrder];
    const sortClause = [sortComponent];

    if (sortField !== "createdAt") {
      sortClause.push(["createdAt", "asc"]);
    }

    const paginationOptions: PaginateOptions = {
      page: listParams.pageNumber,
      limit: listParams.pageSize,
      sort: sortClause,
    };
    const paginatedDocuments = await OperationRecordModel.paginate(
      query,
      paginationOptions
    );
    const result = {
      pageSize: paginatedDocuments.limit,
      pageNumber: paginatedDocuments.page,
      totalPages: paginatedDocuments.totalPages,
      totalResults: paginatedDocuments.totalDocs,
      result: paginatedDocuments.docs.map((x) => mapToOperationRecord(x)),
    };
    logger.debug("Exit DefaultOperationRecordRepository.list", {
      result: {
        ...result,
        result: `${result.result.length} item(s)`,
      },
    });

    return result;
  }
}

export { DefaultOperationRecordRepository };
