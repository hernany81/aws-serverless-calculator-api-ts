import { Operation } from "@app/entity/operation";
import { User, UserId } from "@app/entity/user";

interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByName(name: string): Promise<User | null>;
  updateUserBalance(userId: UserId, operation: Operation): Promise<number>;
}

export { UserRepository };
