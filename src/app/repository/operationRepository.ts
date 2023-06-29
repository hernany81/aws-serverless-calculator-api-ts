import { Operation, OperationType } from "../entity/operation";

interface OperationRepository {
  findByOperationType(type: OperationType): Promise<Operation>;
}

export { OperationRepository };
