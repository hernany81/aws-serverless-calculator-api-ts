import { OperationType } from "@app/entity/operation";
import { UserId } from "@app/entity/user";
import { User as UserModel } from "@infra/persistance/model/user";
import { DefaultUserRepository } from "@infra/repository/userRepository";
import { connectMongo, disconnectMongo } from "../utils/database";
import * as unitOfWorkApi from "@infra/utils/unitOfWork";

describe("DefaultUserRepository integration tests", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => await disconnectMongo());

  beforeEach(async () => {
    await UserModel.collection.deleteMany();
  });

  const userRepository = new DefaultUserRepository();

  test("Find user by id - user exists", async () => {
    // arrange
    const createdUser = await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "ACTIVE",
    });

    // act
    const foundUser = await userRepository.findById(
      UserId.for(createdUser._id.toString())
    );

    // assert
    expect(foundUser.id.value).toEqual(createdUser._id.toString());
    expect(foundUser.name).toEqual(createdUser.name);
    expect(foundUser.passwordHash).toEqual(createdUser.passwordHash);
    expect(foundUser.status).toEqual(createdUser.status);
    expect(foundUser.creditBalance).toEqual(createdUser.creditBalance);
  });

  test("Find user by id - user doesn't exist", async () => {
    // arrange
    // act
    const foundUser = await userRepository.findById(
      UserId.for("6487d44ab09be83793f5b30a")
    );

    // assert
    expect(foundUser).toBeNull();
  });

  test("Find user by id - user exists but is inactive", async () => {
    // arrange
    const createdUser = await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "INACTIVE",
    });

    // act
    const foundUser = await userRepository.findById(
      UserId.for(createdUser._id.toString())
    );

    // assert
    expect(foundUser).toBeNull();
  });

  test("Find user by name - user exists", async () => {
    // arrange
    const createdUser = await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "ACTIVE",
    });

    // act
    const foundUser = await userRepository.findByName("Bill Murray");

    // assert
    expect(foundUser.id.value).toEqual(createdUser._id.toString());
    expect(foundUser.name).toEqual(createdUser.name);
    expect(foundUser.passwordHash).toEqual(createdUser.passwordHash);
    expect(foundUser.status).toEqual(createdUser.status);
    expect(foundUser.creditBalance).toEqual(createdUser.creditBalance);
  });

  test("Find user by name - user doesn't exist", async () => {
    // arrange
    // act
    const foundUser = await userRepository.findByName("Joe");

    // assert
    expect(foundUser).toBeNull();
  });

  test("Find user by name - user exists but is inactive", async () => {
    // arrange
    await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "INACTIVE",
    });

    // act
    const foundUser = await userRepository.findByName("Bill Murray");

    // assert
    expect(foundUser).toBeNull();
  });

  test("Update user balance", async () => {
    // arrange
    const createdUser = await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "ACTIVE",
    });

    // act
    const newBalance = await userRepository.updateUserBalance(
      UserId.for(createdUser._id.toString()),
      {
        id: undefined,
        type: OperationType.ADDITION,
        cost: 0.3,
      }
    );

    // assert
    expect(newBalance).toEqual(5.2);
    expect((await UserModel.findById(createdUser._id)).creditBalance).toEqual(
      5.2
    );
  });

  test("Updating user balance calls the getSession to operate within a unit of work", async () => {
    // arrange
    const getSessionSpy = jest.spyOn(unitOfWorkApi, "getSession");
    const createdUser = await UserModel.create({
      name: "Bill Murray",
      passwordHash: "passHash",
      creditBalance: 5.5,
      status: "ACTIVE",
    });

    // act
    await userRepository.updateUserBalance(
      UserId.for(createdUser._id.toString()),
      {
        id: undefined,
        type: OperationType.ADDITION,
        cost: 0.3,
      }
    );

    // assert
    expect(getSessionSpy).toHaveBeenCalled();
  });
});
