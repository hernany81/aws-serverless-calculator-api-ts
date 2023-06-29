import { connectMongo, disconnectMongo } from "../utils/database";
import { Operation as OperationModel } from "@infra/persistance/model/operation";
import { DefaultOperationRepository } from "@infra/repository/operationRepository";
import { OperationType } from "@app/entity/operation";

describe("DefaultOperationRepository integration tests", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => await disconnectMongo());

  beforeEach(async () => {
    await OperationModel.collection.deleteMany();
  });

  const operationRepository = new DefaultOperationRepository();

  test("Find by type - operation exists", async () => {
    // arrange
    const createdOperation = await OperationModel.create({
      type: OperationType.ADDITION,
      cost: 5.33,
    });

    // act
    const found = await operationRepository.findByOperationType(
      OperationType.ADDITION
    );

    // assert
    expect(found.id.value).toEqual(createdOperation._id.toString());
    expect(found.type).toEqual(OperationType.ADDITION);
    expect(found.cost).toEqual(5.33);
  });

  test("Find by type - operation doesn't exist", async () => {
    // arrange
    // act & assert
    await expect(
      operationRepository.findByOperationType(OperationType.ADDITION)
    ).rejects.toThrow("Cannot find operation for type: ADDITION");
  });
});
