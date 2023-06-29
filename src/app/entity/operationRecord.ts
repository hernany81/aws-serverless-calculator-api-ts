import { OperationId, OperationType } from "./operation";
import { UserId } from "./user";

class OperationRecordId {
  private constructor(readonly value: string) {
    this.value = value;
  }

  static for = (val: string) => new OperationRecordId(val);

  toString(): string {
    return this.value;
  }
}

class OperationRecord {
  private constructor(
    readonly id: OperationRecordId,
    readonly operationId: OperationId,
    readonly type: OperationType,
    readonly userId: UserId,
    /**
     * amount
     */
    readonly cost: number,
    readonly userBalance: number,
    readonly operationInput: string[],
    /**
     * operation response
     */
    readonly operationResult: string,
    /**
     * created
     */
    readonly createdAt: Date,
    readonly deletedAt?: Date
  ) {}

  static for = ({
    id,
    operationId,
    type,
    userId,
    cost,
    userBalance,
    operationInput,
    operationResult,
    createdAt,
    deletedAt,
  }: Omit<OperationRecord, "id"> & { id?: OperationRecordId }) =>
    new OperationRecord(
      id,
      operationId,
      type,
      userId,
      cost,
      userBalance,
      operationInput,
      operationResult,
      createdAt,
      deletedAt
    );
}

export { OperationRecordId, OperationRecord };
