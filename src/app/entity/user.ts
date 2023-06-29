enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

class UserId {
  readonly value: string;

  static for = (val: string) => new UserId(val);

  private constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

class User {
  private constructor(
    readonly id: UserId,
    readonly name: string,
    readonly passwordHash: string,
    readonly status: UserStatus,
    readonly creditBalance: number
  ) {}

  static for = ({ id, name, passwordHash, status, creditBalance }: User) =>
    new User(id, name, passwordHash, status, creditBalance);
}

export { UserStatus, UserId, User };
