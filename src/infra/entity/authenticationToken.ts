import { UserId } from "@app/entity/user";

class AuthenticationToken {
  private constructor(
    readonly token: string,
    readonly userId: UserId,
    readonly createdAt: Date
  ) {}

  static for = ({ token, userId, createdAt }: AuthenticationToken) =>
    new AuthenticationToken(token, userId, createdAt);
}

export { AuthenticationToken };
