import { AsyncLocalStorage } from "async_hooks";
import mongoose, { ClientSession } from "mongoose";
import { applicationLogger } from "./logging";

const logger = applicationLogger;

const unitOfWorkAsyncLocalStorage = new AsyncLocalStorage();

async function runWithinUnitOfWork(
  callback: () => Promise<void>
): Promise<void> {
  logger.info("Enter runWithinUnitOfWork");
  const session = await mongoose.startSession();

  try {
    return await unitOfWorkAsyncLocalStorage.run(session, () => callback());
  } finally {
    session.endSession();
    logger.info("Exit runWithinUnitOfWork");
  }
}

function getSession(): ClientSession {
  return unitOfWorkAsyncLocalStorage.getStore() as ClientSession;
}

export { runWithinUnitOfWork, getSession };
