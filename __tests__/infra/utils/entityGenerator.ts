import { OperationId, OperationType } from "@app/entity/operation";
import { OperationRecord } from "@app/entity/operationRecord";
import { UserId } from "@app/entity/user";

function createOperationRecord(data: Partial<OperationRecord> = {}) {
  return OperationRecord.for({
    operationId:
      data.operationId ?? OperationId.for("6487d44a31ba91ba0a84424b"),
    type: data.type ?? OperationType.MULTIPLICATION,
    userId: data.userId ?? UserId.for("6487d44a31ba91ba0a84424a"),
    cost: data.cost ?? 5.24,
    userBalance: data.userBalance ?? 234.56789,
    operationInput: data.operationInput ?? ["value-1", "value-2", "value-3"],
    operationResult: data.operationResult ?? "op-result",
    createdAt: data.createdAt ?? new Date(),
  });
}

export { createOperationRecord };
