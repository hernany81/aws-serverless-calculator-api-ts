import { Operation } from "@app/entity/operation";
import { UserId, User, UserStatus } from "@app/entity/user";
import { UserRepository } from "@app/repository/userRepository";
import { UserDocument, User as UserModel } from "@infra/persistance/model/user";
import { applicationLogger } from "@infra/utils/logging";
import { getSession } from "@infra/utils/unitOfWork";

const logger = applicationLogger;

function mapUserStatusFromDb(status: string): UserStatus {
  logger.debug("Enter mapUserStatusFromDb", { status });

  let userStatus: UserStatus;

  switch (status.toLowerCase()) {
    case "active":
      userStatus = UserStatus.ACTIVE;
      break;
    case "inactive":
      userStatus = UserStatus.INACTIVE;
      break;
    default:
      throw new Error(`Unrecognizable value: ${status}`);
  }
  logger.debug("Exit mapUserStatusFromDb", { userStatus });
  return userStatus;
}

function mapUserModel(userModel: UserDocument): User {
  logger.debug("Enter mapUserModel", { userModel });
  const result = User.for({
    id: UserId.for(userModel._id.toString()),
    name: userModel.name,
    passwordHash: userModel.passwordHash,
    creditBalance: userModel.creditBalance,
    status: mapUserStatusFromDb(userModel.status),
  });
  logger.debug("Exit mapUserModel", { result });
  return result;
}

class DefaultUserRepository implements UserRepository {
  async findById(id: UserId): Promise<User | null> {
    logger.info("Enter DefaultUserRepository.findById", { id });
    const userModel = await UserModel.findOne({
      _id: id.value,
      status: "ACTIVE",
    }).exec();

    if (!userModel) {
      logger.info("Exit DefaultUserRepository.findById -> null");
      return null;
    }

    const result = mapUserModel(userModel);
    logger.info("Exit DefaultUserRepository.findById -> ", { result });
    return result;
  }

  async findByName(name: string): Promise<User | null> {
    logger.info("Enter DefaultUserRepository.findByName", { name });
    const userModel = await UserModel.findOne({
      name: name,
      status: "ACTIVE",
    }).exec();

    if (!userModel) {
      logger.info("Exit DefaultUserRepository.findByName -> null");
      return null;
    }

    const result = mapUserModel(userModel);
    logger.info("Exit DefaultUserRepository.findByName -> ", { result });
    return result;
  }

  async updateUserBalance(
    userId: UserId,
    operation: Operation
  ): Promise<number> {
    logger.info("Enter DefaultUserRepository.updateUserBalance", {
      userId,
      operation,
    });
    const session = getSession();
    const opResult = await UserModel.findByIdAndUpdate<UserDocument>(
      userId.value,
      {
        $inc: { creditBalance: -operation.cost },
      },
      { session, new: true }
    );
    logger.info("Exit DefaultUserRepository.updateUserBalance -> ", {
      creditBalance: opResult.creditBalance,
    });
    return opResult.creditBalance;
  }
}

export { DefaultUserRepository };
