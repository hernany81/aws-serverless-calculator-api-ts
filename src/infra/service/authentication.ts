import { User, UserStatus } from "@app/entity/user";
import { UserRepository } from "@app/repository/userRepository";
import { ApplicationError, DateProvider } from "@app/utils/common";
import { AuthenticationToken } from "@infra/entity/authenticationToken";
import { AuthenticationTokenRepository } from "@infra/repository/authenticationTokenRepository";
import { applicationLogger } from "@infra/utils/logging";
import { randomBytes, randomUUID } from "crypto";
import { argon2id, argon2Verify } from "hash-wasm";

const logger = applicationLogger;

class UserNotAuthenticatedError extends ApplicationError {
  constructor(message?: string, options?: ErrorOptions) {
    super("UserNotAuthenticatedError", message, options);
  }
}

interface TokenValueGenerator {
  generate(): string;
}

class DefaultTokenValueGenerator implements TokenValueGenerator {
  generate() {
    logger.debug("Enter DefaultTokenValueGenerator.generate");
    const result = randomUUID().replaceAll("-", "");
    logger.debug("Exit DefaultTokenValueGenerator.generate", { result });
    return result;
  }
}

interface PasswordHashser {
  hash(pass: string): Promise<string>;
  isValid(pass: string, hash: string): Promise<boolean>;
}

class DefaultPasswordHasher implements PasswordHashser {
  async hash(pass: string): Promise<string> {
    logger.debug("Enter DefaultPasswordHasher.hash", { pass: "[REDACTED]" });
    const salt = randomBytes(16);
    const hashValue = await argon2id({
      password: pass,
      salt,
      parallelism: 1,
      iterations: 256,
      memorySize: 512, // 512 KB
      hashLength: 16,
      outputType: "encoded",
    });
    logger.debug("Exit DefaultPasswordHasher.hash -> ", hashValue);
    return hashValue;
  }

  async isValid(pass: string, hash: string): Promise<boolean> {
    logger.debug("Enter DefaultPasswordHasher.isValid", {
      pass: "[REDACTED]",
      hash,
    });
    const result = await argon2Verify({ password: pass, hash });
    logger.debug("Exit DefaultPasswordHasher.isValid -> ", { result });
    return result;
  }
}

interface AuthenticationService {
  getUserFromAuthenticationToken(token: string): Promise<User>;
  login(username: string, password: string): Promise<string>;
  logout(token: string): Promise<void>;
}

class DefaultAuthenticationService implements AuthenticationService {
  constructor(
    private readonly authenticationTokenRepository: AuthenticationTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly dateProvider: DateProvider,
    private readonly tokenValueGenerator: TokenValueGenerator,
    private readonly passwordHasher: PasswordHashser
  ) {}

  async getUserFromAuthenticationToken(token: string): Promise<User> {
    logger.info(
      "Enter DefaultAuthenticationService.getUserFromAuthenticationToken",
      { token }
    );
    const persistedAuthToken =
      await this.authenticationTokenRepository.findByAuthorizationToken(token);

    if (!persistedAuthToken) {
      throw new UserNotAuthenticatedError("Invalid security token provided");
    }
    const result = await this.userRepository.findById(
      persistedAuthToken.userId
    );
    logger.info(
      "Exit DefaultAuthenticationService.getUserFromAuthenticationToken -> ",
      { result }
    );

    return result;
  }

  async login(username: string, password: string): Promise<string> {
    logger.info("Enter DefaultAuthenticationService.login", {
      username,
      password: "[REDACTED]",
    });
    const user = await this.userRepository.findByName(username);
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !(await this.passwordHasher.isValid(password, user.passwordHash))
    ) {
      throw new UserNotAuthenticatedError("Cannot authenticate user");
    }
    const token = this.tokenValueGenerator.generate();
    const authenticationToken = AuthenticationToken.for({
      token,
      userId: user.id,
      createdAt: this.dateProvider.now(),
    });
    await this.authenticationTokenRepository.save(authenticationToken);
    logger.info("Exit DefaultAuthenticationService.login -> ", { token });
    return token;
  }

  async logout(token: string): Promise<void> {
    logger.info("Enter DefaultAuthenticationService.logout", { token });
    const persistedAuthToken =
      await this.authenticationTokenRepository.findByAuthorizationToken(token);
    if (persistedAuthToken) {
      await this.authenticationTokenRepository.delete(persistedAuthToken);
    }
    logger.info("Exit DefaultAuthenticationService.logout");
  }
}

export {
  AuthenticationService,
  DefaultAuthenticationService,
  DefaultPasswordHasher,
  DefaultTokenValueGenerator,
  PasswordHashser,
  TokenValueGenerator,
  UserNotAuthenticatedError,
};
