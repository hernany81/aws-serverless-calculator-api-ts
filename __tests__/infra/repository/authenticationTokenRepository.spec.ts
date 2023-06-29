import { connectMongo, disconnectMongo } from "../utils/database";
import { AuthenticationToken as AuthenticationTokenModel } from "@infra/persistance/model/authenticationToken";
import { DefaultAuthenticationTokenRepository } from "@infra/repository/authenticationTokenRepository";
import { AuthenticationToken } from "@infra/entity/authenticationToken";
import { UserId } from "@app/entity/user";

describe("DefaultAuthenticationTokenRepository integration tests", () => {
  beforeAll(async () => {
    await connectMongo();
  });

  afterAll(async () => await disconnectMongo());

  beforeEach(async () => {
    await AuthenticationTokenModel.collection.deleteMany();
  });

  const authTokenRepository = new DefaultAuthenticationTokenRepository();

  // This also tests the save method
  test("Find by token - auth token exists", async () => {
    // arrange
    const createdAuthToken = await AuthenticationTokenModel.create({
      token: "secure-token",
      userId: "6487d44ab09be83793f5b30a",
      createdAt: new Date(),
    });

    // act
    const foundAuthToken = await authTokenRepository.findByAuthorizationToken(
      "secure-token"
    );

    // assert
    expect(foundAuthToken.token).toEqual(createdAuthToken.token);
    expect(foundAuthToken.userId.value).toEqual(
      createdAuthToken.userId.toString()
    );
    expect(foundAuthToken.createdAt).toEqual(createdAuthToken.createdAt);
  });

  test("Find by token - auth token doesn't exist", async () => {
    // arrange
    // act
    const foundAuthToken = await authTokenRepository.findByAuthorizationToken(
      "secure-token"
    );

    // assert
    expect(foundAuthToken).toBeNull();
  });

  test("Delete - auth token exists", async () => {
    // arrange
    await AuthenticationTokenModel.create({
      token: "secure-token",
      userId: "6487d44ab09be83793f5b30a",
      createdAt: new Date(),
    });

    const authToken = await authTokenRepository.findByAuthorizationToken(
      "secure-token"
    );

    // act
    await authTokenRepository.delete(authToken);

    // assert
    const totalDocs = await AuthenticationTokenModel.exists({
      token: "secure-token",
    }).exec();
    expect(totalDocs).toBeNull();
  });

  test("Delete - auth token doesn't exist", async () => {
    // arrange
    // act & assert
    await expect(
      authTokenRepository.delete(
        AuthenticationToken.for({
          token: "secure-token",
          userId: UserId.for("user-id"),
          createdAt: new Date(),
        })
      )
    ).resolves.not.toThrow();
  });
});
