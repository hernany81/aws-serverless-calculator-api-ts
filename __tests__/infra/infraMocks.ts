import { User, UserId, UserStatus } from "@app/entity/user";
import { AuthenticationToken } from "@infra/entity/authenticationToken";
import { AuthenticationTokenRepository } from "@infra/repository/authenticationTokenRepository";
import { AuthenticationService } from "@infra/service/authentication";
import { randomUUID } from "crypto";

function getAuthenticationTokenRepositoryMock(): AuthenticationTokenRepository {
  return {
    findByAuthorizationToken: jest.fn((_) => {
      return Promise.resolve(
        AuthenticationToken.for({
          token: randomUUID(),
          userId: UserId.for(randomUUID()),
          createdAt: new Date(),
        })
      );
    }),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

function getRandomStringClientMock(): RandomStringClient {
  return {
    generate: jest.fn(() => {
      return Promise.resolve("this-is-a-random-string");
    }),
  };
}

function getAuthenticationServiceMock(): AuthenticationService {
  return {
    getUserFromAuthenticationToken: jest.fn((_token) =>
      Promise.resolve(
        User.for({
          id: UserId.for(randomUUID()),
          name: "John Doe",
          passwordHash: randomUUID(),
          status: UserStatus.ACTIVE,
          creditBalance: 100,
        })
      )
    ),
    login: jest.fn(() => Promise.resolve(randomUUID())),
    logout: jest.fn(),
  };
}

export {
  getAuthenticationTokenRepositoryMock,
  getRandomStringClientMock,
  getAuthenticationServiceMock,
};
