import { Operation, OperationId, OperationType } from "@app/entity/operation";
import { OperationRepository } from "@app/repository/operationRepository";
import {
  OperationDocument,
  Operation as OperationModel,
} from "@infra/persistance/model/operation";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

function mapToOperation(operationDoc: OperationDocument): Operation {
  logger.debug("Enter mapToOperation", { operationDoc });
  const operationTypeEnum = Object.values(OperationType).find(
    (x) => x === operationDoc.type
  );

  if (!operationTypeEnum) {
    throw Error(`Unrecognized operation type: ${operationDoc.type}`);
  }

  const result = Operation.for({
    id: OperationId.for(operationDoc._id.toString()),
    type: operationTypeEnum,
    cost: operationDoc.cost,
  });
  logger.debug("Exit mapToOperation -> ", { result });
  return result;
}

class DefaultOperationRepository implements OperationRepository {
  async findByOperationType(type: OperationType): Promise<Operation> {
    logger.info("Enter DefaultOperationRepository.findByOperationType", {
      type,
    });
    const found = await OperationModel.findOne({ type: type }).exec();

    if (!found) {
      throw Error(`Cannot find operation for type: ${type}`);
    }

    const result = mapToOperation(found);
    logger.info("Exit DefaultOperationRepository.findByOperationType", {
      result,
    });
    return result;
  }
}

export { DefaultOperationRepository };
