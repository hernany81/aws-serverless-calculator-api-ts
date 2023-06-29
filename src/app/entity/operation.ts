enum OperationType {
  ADDITION = "ADDITION",
  SUBTRACTION = "SUBTRACTION",
  MULTIPLICATION = "MULTIPLICATION",
  DIVISION = "DIVISION",
  SQUARE_ROOT = "SQUARE_ROOT",
  RANDOM_STRING = "RANDOM_STRING",
}

class OperationId {
  private constructor(readonly value: string) {
    this.value = value;
  }

  static for = (val: string) => new OperationId(val);

  toString(): string {
    return this.value;
  }
}

class Operation {
  private constructor(
    readonly id: OperationId,
    readonly type: OperationType,
    readonly cost: number
  ) {}

  static for = ({ id, type, cost }: Operation) => new Operation(id, type, cost);
}

export { OperationType, OperationId, Operation };
