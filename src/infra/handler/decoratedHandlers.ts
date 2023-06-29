import { middyfy } from "@infra/utils/middlewares";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { ValidatedEventAPIGatewayProxyEvent } from "../utils/apiGateway";
import { loginSchema } from "./auth/schemas";
import {
  addSchema,
  divideSchema,
  multiplySchema,
  squareRootSchema,
  subtractSchema,
} from "./calculator/schemas";
import { deleteSchema, listSchema } from "./operationrecord/schemas";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

const getDecoratedLoginHandler = (
  loginHandler: ValidatedEventAPIGatewayProxyEvent<typeof loginSchema>
) => {
  logger.debug("Enter getDecoratedLoginHandler");
  const decoratedHandler = middyfy(loginHandler, { eventSchema: loginSchema });
  logger.debug("Exit getDecoratedLoginHandler");
  return decoratedHandler;
};

const getDecoratedLogoutHandler = (
  logoutHandler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
) => {
  logger.debug("Enter getDecoratedLogoutHandler");
  const decoratedHandler = middyfy(logoutHandler, { requiresAuth: true });
  logger.debug("Exit getDecoratedLogoutHandler");
  return decoratedHandler;
};

const getDecoratedProfileHandler = (
  profileHandler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
) => {
  logger.debug("Enter getDecoratedProfileHandler");
  const decoratedHandler = middyfy(profileHandler, { requiresAuth: true });
  logger.debug("Exit getDecoratedProfileHandler");
  return decoratedHandler;
};

const getDecoratedAddHandler = (
  addHandler: ValidatedEventAPIGatewayProxyEvent<typeof addSchema>
) => {
  logger.debug("Enter getDecoratedAddHandler");
  const decoratedHandler = middyfy(addHandler, {
    eventSchema: addSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedAddHandler");
  return decoratedHandler;
};

const getDecoratedDivideHandler = (
  divideHandler: ValidatedEventAPIGatewayProxyEvent<typeof divideSchema>
) => {
  logger.debug("Enter getDecoratedDivideHandler");
  const decoratedHandler = middyfy(divideHandler, {
    eventSchema: divideSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedDivideHandler");
  return decoratedHandler;
};

const getDecoratedMultiplyHandler = (
  multiplyHandler: ValidatedEventAPIGatewayProxyEvent<typeof multiplySchema>
) => {
  logger.debug("Enter getDecoratedMultiplyHandler");
  const decoratedHandler = middyfy(multiplyHandler, {
    eventSchema: multiplySchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedMultiplyHandler");
  return decoratedHandler;
};

const getDecoratedRandomStringHandler = (
  randomStringHandler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult>
) => {
  logger.debug("Enter getDecoratedRandomStringHandler");
  const decoratedHandler = middyfy(randomStringHandler, { requiresAuth: true });
  logger.debug("Exit getDecoratedRandomStringHandler");
  return decoratedHandler;
};

const getDecoratedSquareRootHandler = (
  squareRootHandler: ValidatedEventAPIGatewayProxyEvent<typeof squareRootSchema>
) => {
  logger.debug("Enter getDecoratedSquareRootHandler");
  const decoratedHandler = middyfy(squareRootHandler, {
    eventSchema: squareRootSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedSquareRootHandler");
  return decoratedHandler;
};

const getDecoratedSubtractHandler = (
  subtractHandler: ValidatedEventAPIGatewayProxyEvent<typeof subtractSchema>
) => {
  logger.debug("Enter getDecoratedSubtractHandler");
  const decoratedHandler = middyfy(subtractHandler, {
    eventSchema: subtractSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedSubtractHandler");
  return decoratedHandler;
};

const getDecoratedListOperationsRecordHandler = (
  listOperationRecordsHandler: ValidatedEventAPIGatewayProxyEvent<
    typeof listSchema
  >
) => {
  logger.debug("Enter getDecoratedListOperationRecordsHandler");
  const decoratedHandler = middyfy(listOperationRecordsHandler, {
    eventSchema: listSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedListOperationRecordsHandler");
  return decoratedHandler;
};

const getDecoratedDeleteOperationRecordHandler = (
  deleteOperationRecordHandler: ValidatedEventAPIGatewayProxyEvent<
    typeof deleteSchema
  >
) => {
  logger.debug("Enter getDecoratedDeleteOperationRecordHandler");
  const decoratedHandler = middyfy(deleteOperationRecordHandler, {
    eventSchema: deleteSchema,
    requiresAuth: true,
  });
  logger.debug("Exit getDecoratedDeleteOperationRecordHandler");
  return decoratedHandler;
};

export {
  getDecoratedAddHandler,
  getDecoratedDeleteOperationRecordHandler,
  getDecoratedDivideHandler,
  getDecoratedListOperationsRecordHandler,
  getDecoratedLoginHandler,
  getDecoratedLogoutHandler,
  getDecoratedProfileHandler,
  getDecoratedMultiplyHandler,
  getDecoratedRandomStringHandler,
  getDecoratedSquareRootHandler,
  getDecoratedSubtractHandler,
};
