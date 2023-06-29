import { User, UserId, UserStatus } from "@app/entity/user";
import { AuthenticationToken } from "@infra/entity/authenticationToken";
import {
  DefaultAuthenticationService,
  DefaultPasswordHasher,
  PasswordHashser,
  TokenValueGenerator,
  UserNotAuthenticatedError,
} from "@infra/service/authentication";
import { randomUUID } from "crypto";
import { getDateProviderMock, getUserRepositoryMock } from "../../app/appMocks";
import { getAuthenticationTokenRepositoryMock } from "../infraMocks";

describe("DefaultPasswordHasher", () => {
  const passwordHasher = new DefaultPasswordHasher();

  test("Password can be hashed", async () => {
    // arrange
    // act
    const hash = await passwordHasher.hash("super secret");

    // assert
    expect(hash).toBeTruthy();
    expect(hash.length).toBe(76);
  });

  test("Password can be verified", async () => {
    // arrange
    // act
    const validMatch = await passwordHasher.isValid(
      "super secret",
      "$argon2id$v=19$m=512,t=256,p=1$knoIbo4xMtOkNuOMrb0a+Q$Uw9KcXX1ZHgH1Lpwxe6cUw"
    );
    const invalidMatch = await passwordHasher.isValid(
      "super secret!",
      "$argon2id$v=19$m=512,t=256,p=1$knoIbo4xMtOkNuOMrb0a+Q$Uw9KcXX1ZHgH1Lpwxe6cUw"
    );

    // assert
    expect(validMatch).toBeTruthy();
    expect(invalidMatch).toBeFalsy();
  });
});

describe("DefaultAuthenticationService", () => {
  const authenticationTokenRepository = getAuthenticationTokenRepositoryMock();
  const userRepository = getUserRepositoryMock();
  const dateProvider = getDateProviderMock();
  const passwordHasher: PasswordHashser = {
    hash: jest.fn(),
    isValid: jest.fn(),
  };
  const tokenValueGenerator: TokenValueGenerator = {
    generate: jest.fn(() => randomUUID()),
  };
  const authenticationService = new DefaultAuthenticationService(
    authenticationTokenRepository,
    userRepository,
    dateProvider,
    tokenValueGenerator,
    passwordHasher
  );

  const isValidPasswordAndHashCallMock = jest.mocked(passwordHasher.isValid);

  const generateTokenValueCallMock = jest.mocked(tokenValueGenerator.generate);

  const findAuthorizationTokenByTokenMock = jest.mocked(
    authenticationTokenRepository.findByAuthorizationToken
  );

  const findUserByNameCallMock = jest.mocked(userRepository.findByName);

  test("get user by token - error when token not found", async () => {
    // arrange
    findAuthorizationTokenByTokenMock.mockResolvedValue(undefined);

    // act & assert
    await expect(
      authenticationService.getUserFromAuthenticationToken("secure-token")
    ).rejects.toMatchObject<Partial<UserNotAuthenticatedError>>({
      message: "Invalid security token provided",
    });
  });

  test("get user by token - successful", async () => {
    // arrange
    const authToken = AuthenticationToken.for({
      token: "secure-token",
      userId: UserId.for("this-is-a-user-id"),
      createdAt: new Date(),
    });
    findAuthorizationTokenByTokenMock.mockResolvedValue(authToken);

    // act
    const user = await authenticationService.getUserFromAuthenticationToken(
      "secure-token"
    );

    // assert
    expect(user).not.toBeFalsy();
    expect(
      authenticationTokenRepository.findByAuthorizationToken
    ).toHaveBeenCalledWith("secure-token");
    expect(userRepository.findById).toHaveBeenCalledWith(
      UserId.for("this-is-a-user-id")
    );
  });

  test("login - error when user cannot be found", async () => {
    // arrange
    findUserByNameCallMock.mockResolvedValue(undefined);

    // act & assert
    await expect(
      authenticationService.login("john", "secret-pass")
    ).rejects.toMatchObject<Partial<UserNotAuthenticatedError>>({
      message: "Cannot authenticate user",
    });
  });

  test("login - user is not active", async () => {
    // arrange
    const user = User.for({
      id: UserId.for("user-id"),
      name: "john",
      passwordHash: "hashed-password",
      status: UserStatus.INACTIVE,
      creditBalance: 100,
    });
    isValidPasswordAndHashCallMock.mockResolvedValue(true);
    findUserByNameCallMock.mockResolvedValue(user);

    // act & assert
    await expect(
      authenticationService.login("john", "secret-pass")
    ).rejects.toMatchObject<Partial<UserNotAuthenticatedError>>({
      message: "Cannot authenticate user",
    });
    expect(passwordHasher.isValid).not.toHaveBeenCalled();
  });

  test("login - error passwords don't match", async () => {
    // arrange
    const user = User.for({
      id: UserId.for("user-id"),
      name: "john",
      passwordHash: "hashed-password",
      status: UserStatus.ACTIVE,
      creditBalance: 100,
    });
    isValidPasswordAndHashCallMock.mockResolvedValue(false);
    findUserByNameCallMock.mockResolvedValue(user);

    // act & assert
    await expect(
      authenticationService.login("john", "secret-pass-XXX")
    ).rejects.toMatchObject<Partial<UserNotAuthenticatedError>>({
      message: "Cannot authenticate user",
    });
    expect(passwordHasher.isValid).toHaveBeenCalledWith(
      "secret-pass-XXX",
      "hashed-password"
    );
  });

  test("login - success", async () => {
    // arrange
    generateTokenValueCallMock.mockReturnValue("secure-generated-token");

    const user = User.for({
      id: UserId.for("user-id"),
      name: "john",
      passwordHash: "hashed-password",
      status: UserStatus.ACTIVE,
      creditBalance: 100,
    });
    isValidPasswordAndHashCallMock.mockResolvedValue(true);
    findUserByNameCallMock.mockResolvedValue(user);

    // act & assert
    const authTokenStr = await authenticationService.login(
      "john",
      "secret-pass"
    );
    expect(authTokenStr).toBe("secure-generated-token");
    expect(passwordHasher.isValid).toHaveBeenCalledWith(
      "secret-pass",
      "hashed-password"
    );
  });

  test("logout - success even if auth token cannot be found", async () => {
    // arrange
    findAuthorizationTokenByTokenMock.mockResolvedValue(undefined);

    // act
    await authenticationService.logout("secure-token");

    // assert
    expect(
      authenticationTokenRepository.findByAuthorizationToken
    ).toHaveBeenCalledWith("secure-token");
    expect(authenticationTokenRepository.delete).not.toHaveBeenCalled();
  });

  test("logout - success", async () => {
    // arrange
    const authToken = AuthenticationToken.for({
      token: "secure-token",
      userId: UserId.for("this-is-a-user-id"),
      createdAt: new Date(),
    });
    findAuthorizationTokenByTokenMock.mockResolvedValue(authToken);

    // act
    await authenticationService.logout("secure-token");

    // assert
    expect(
      authenticationTokenRepository.findByAuthorizationToken
    ).toHaveBeenCalledWith("secure-token");
    expect(authenticationTokenRepository.delete).toHaveBeenCalledWith(
      authToken
    );
  });
});
