import { OperationRecordId } from "@app/entity/operationRecord";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

interface DeleteOperationRecordService {
  execute(id: OperationRecordId): Promise<OperationRecordId>;
}

class DefaultDeleteOperationRecordService
  implements DeleteOperationRecordService
{
  constructor(
    private readonly operationRecordRepository: OperationRecordRepository
  ) {}

  async execute(id: OperationRecordId): Promise<OperationRecordId> {
    logger.info("Enter DefaultDeleteOperationRecordService.execute", { id });
    const result = await this.operationRecordRepository.delete(id);
    logger.info("Exit DefaultDeleteOperationRecordService.execute -> ", {
      result,
    });
    return result;
  }
}

export { DefaultDeleteOperationRecordService, DeleteOperationRecordService };
