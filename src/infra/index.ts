import { Addition } from "@app/usecase/calculator/addition";
import { Division } from "@app/usecase/calculator/division";
import { Multiplication } from "@app/usecase/calculator/multiplication";
import { RandomString } from "@app/usecase/calculator/randomString";
import { SquareRoot } from "@app/usecase/calculator/squareRoot";
import { Subtraction } from "@app/usecase/calculator/subtraction";
import { DefaultDeleteOperationRecordService } from "@app/usecase/operationrecord/delete";
import { DefaultListOperationRecordsService } from "@app/usecase/operationrecord/list";
import {
  DefaultDateProvider,
  DefaultNumberConversion,
} from "@app/utils/common";
import mongoose from "mongoose";
import { env } from "process";
import {
  CircuitBreakerRandomStringClient,
  DefaultRandomStringClient,
} from "./client/randomString";
import { getLoginHandler, getLogoutHandler } from "./handler/auth/handlers";
import {
  getAddHandler,
  getDivideHandler,
  getMultiplyHandler,
  getRandomStringHandler,
  getSquareRootHandler,
  getSubtractHandler,
} from "./handler/calculator/handlers";
import {
  getDecoratedAddHandler,
  getDecoratedDeleteOperationRecordHandler,
  getDecoratedDivideHandler,
  getDecoratedListOperationsRecordHandler,
  getDecoratedLoginHandler,
  getDecoratedLogoutHandler,
  getDecoratedMultiplyHandler,
  getDecoratedProfileHandler,
  getDecoratedRandomStringHandler,
  getDecoratedSquareRootHandler,
  getDecoratedSubtractHandler,
} from "./handler/decoratedHandlers";
import {
  getDeleteHandler,
  getListHandler,
} from "./handler/operationrecord/handlers";
import { DefaultAuthenticationTokenRepository } from "./repository/authenticationTokenRepository";
import { DefaultOperationRecordRepository } from "./repository/operationRecordRepository";
import { DefaultOperationRepository } from "./repository/operationRepository";
import { DefaultUserRepository } from "./repository/userRepository";
import {
  DefaultAuthenticationService,
  DefaultPasswordHasher,
  DefaultTokenValueGenerator,
} from "./service/authentication";
import { getProfileHandler } from "./handler/profile/handlers";

mongoose.connect(env.MONGODB_URL);

const dateProvider = new DefaultDateProvider();

const numberConversion = new DefaultNumberConversion();

const tokenValueGenerator = new DefaultTokenValueGenerator();

const operationRepository = new DefaultOperationRepository();

const authenticationTokenRepository =
  new DefaultAuthenticationTokenRepository();

const userRepository = new DefaultUserRepository();

const operationRecordRepository = new DefaultOperationRecordRepository(
  dateProvider
);

const randomStringClient = new CircuitBreakerRandomStringClient(
  new DefaultRandomStringClient("https://www.random.org"),
  dateProvider,
  { millisToClose: 5_000, numberOfErrorsToOpen: 3, waitIncrementFactor: 2 }
);

const authenticationService = new DefaultAuthenticationService(
  authenticationTokenRepository,
  userRepository,
  dateProvider,
  tokenValueGenerator,
  new DefaultPasswordHasher()
);

const additionService = new Addition(
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const divisionService = new Division(
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const multiplicationService = new Multiplication(
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const randomStringService = new RandomString(
  randomStringClient,
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const squareRootService = new SquareRoot(
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const subtractionService = new Subtraction(
  operationRepository,
  operationRecordRepository,
  userRepository,
  dateProvider,
  numberConversion
);

const listOperationRecordsService = new DefaultListOperationRecordsService(
  operationRecordRepository
);

const deleteOperationRecordService = new DefaultDeleteOperationRecordService(
  operationRecordRepository
);

const loginHandler = getLoginHandler(authenticationService);

const logoutHandler = getLogoutHandler(authenticationService);

const profileHandler = getProfileHandler(authenticationService);

const addHandler = getAddHandler({
  additionService,
  authenticationService,
});

const divideHandler = getDivideHandler({
  divisionService,
  authenticationService,
});

const multiplyHandler = getMultiplyHandler({
  multiplicationService,
  authenticationService,
});

const randomStringyHandler = getRandomStringHandler({
  randomStringService,
  authenticationService,
});

const squareRootHandler = getSquareRootHandler({
  squareRootService,
  authenticationService,
});

const subtractHandler = getSubtractHandler({
  subtractionService,
  authenticationService,
});

const listOperationRecordsHandler = getListHandler({
  authenticationService,
  listService: listOperationRecordsService,
});
const deleteOperationRecordHandler = getDeleteHandler({
  deleteService: deleteOperationRecordService,
});

const decoratedLoginHandler = getDecoratedLoginHandler(loginHandler).handler;
const decoratedLogoutHandler = getDecoratedLogoutHandler(logoutHandler).handler;
const decoratedProfileHandler =
  getDecoratedProfileHandler(profileHandler).handler;

const decoratedAddHandler = getDecoratedAddHandler(addHandler).handler;
const decoratedDivideHandler = getDecoratedDivideHandler(divideHandler).handler;
const decoratedMultiplyHandler =
  getDecoratedMultiplyHandler(multiplyHandler).handler;
const decoratedRandomStringHandler =
  getDecoratedRandomStringHandler(randomStringyHandler).handler;
const decoratedSquareRootHandler =
  getDecoratedSquareRootHandler(squareRootHandler).handler;
const decoratedSubtractHandler =
  getDecoratedSubtractHandler(subtractHandler).handler;
const decoratedListOperationRecordsHandler =
  getDecoratedListOperationsRecordHandler(listOperationRecordsHandler).handler;
const decoratedDeleteOperationRecordHandler =
  getDecoratedDeleteOperationRecordHandler(
    deleteOperationRecordHandler
  ).handler;

export {
  decoratedAddHandler as addHandler,
  decoratedDeleteOperationRecordHandler as deleteOperationRecordHandler,
  decoratedDivideHandler as divideHandler,
  decoratedListOperationRecordsHandler as listOperationRecordsHandler,
  decoratedLoginHandler as loginHandler,
  decoratedLogoutHandler as logoutHandler,
  decoratedProfileHandler as profileHandler,
  decoratedMultiplyHandler as multiplyHandler,
  decoratedRandomStringHandler as randomStringHandler,
  decoratedSquareRootHandler as squareRootHandler,
  decoratedSubtractHandler as subtractHandler,
};
