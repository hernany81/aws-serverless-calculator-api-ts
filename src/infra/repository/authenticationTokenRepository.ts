import { UserId } from "@app/entity/user";
import { AuthenticationToken } from "@infra/entity/authenticationToken";
import {
  AuthenticationTokenDocument,
  AuthenticationToken as AuthenticationTokenModel,
} from "@infra/persistance/model/authenticationToken";
import { applicationLogger } from "@infra/utils/logging";
import { Types } from "mongoose";

const logger = applicationLogger;

interface AuthenticationTokenRepository {
  findByAuthorizationToken(
    authorizationToken: string
  ): Promise<AuthenticationToken | null>;
  save(authToken: AuthenticationToken): Promise<void>;
  delete(authToken: AuthenticationToken): Promise<void>;
}

function mapToAuthenticationToken(
  authToken: AuthenticationTokenDocument
): AuthenticationToken {
  return AuthenticationToken.for({
    token: authToken.token,
    userId: UserId.for(authToken.userId.toString()),
    createdAt: authToken.createdAt,
  });
}

function mapFromAuthenticationToken(authToken: AuthenticationToken) {
  return new AuthenticationTokenModel({
    token: authToken.token,
    userId: new Types.ObjectId(authToken.userId.value),
    createdAt: authToken.createdAt,
  });
}

class DefaultAuthenticationTokenRepository
  implements AuthenticationTokenRepository
{
  async findByAuthorizationToken(
    authorizationToken: string
  ): Promise<AuthenticationToken | null> {
    logger.info(
      "Enter DefaultAuthenticationTokenRepository.findByAuthorizationToken",
      { authorizationToken }
    );
    const authToken = await AuthenticationTokenModel.findOne({
      token: authorizationToken,
    }).exec();

    if (!authToken) {
      logger.info(
        "Exit DefaultAuthenticationTokenRepository.findByAuthorizationToken -> null"
      );
      return null;
    }

    const result = mapToAuthenticationToken(authToken);

    logger.info(
      "Exit DefaultAuthenticationTokenRepository.findByAuthorizationToken -> ",
      { result }
    );

    return result;
  }

  async save(authToken: AuthenticationToken): Promise<void> {
    logger.info("Enter DefaultAuthenticationTokenRepository.save", {
      authToken,
    });
    await mapFromAuthenticationToken(authToken).save();
    logger.info("Exit DefaultAuthenticationTokenRepository.save");
  }

  async delete(authToken: AuthenticationToken): Promise<void> {
    logger.info("Enter DefaultAuthenticationTokenRepository.delete", {
      authToken,
    });
    await AuthenticationTokenModel.findOneAndDelete({ token: authToken.token });
    logger.info("Exit DefaultAuthenticationTokenRepository.delete");
  }
}

export { AuthenticationTokenRepository, DefaultAuthenticationTokenRepository };
