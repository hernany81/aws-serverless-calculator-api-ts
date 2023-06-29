import { getSession, runWithinUnitOfWork } from "@infra/utils/unitOfWork";
import mongoose, { ClientSession } from "mongoose";

jest.mock<Partial<typeof mongoose>>("mongoose", () => {
  return {
    startSession: jest.fn(),
  };
});

describe("MongoUnitOfWorkService", () => {
  test("Happy path", async () => {
    // arrange
    const session: ClientSession = {
      endSession: jest.fn(),
    } as unknown as ClientSession;
    let sessionRead: ClientSession;

    jest.mocked(mongoose.startSession).mockResolvedValue(session);

    // act
    await runWithinUnitOfWork(async () => {
      sessionRead = getSession();
      return Promise.resolve();
    });

    // assert
    expect(jest.mocked(session.endSession)).toHaveBeenCalled();
    expect(sessionRead).toBe(session);
  });

  test("Error thrown", async () => {
    // arrange
    const session: ClientSession = {
      endSession: jest.fn(),
    } as unknown as ClientSession;
    let sessionRead: ClientSession;

    jest.mocked(mongoose.startSession).mockResolvedValue(session);

    // act & assert
    await expect(
      runWithinUnitOfWork(async () => {
        sessionRead = getSession();
        throw new Error("Boom!");
      })
    ).rejects.toThrow("Boom!");
    expect(jest.mocked(session.endSession)).toHaveBeenCalled();
    expect(sessionRead).toBe(session);
  });
});
