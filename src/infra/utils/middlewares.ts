import { ApplicationError } from "@app/utils/common";
import middy from "@middy/core";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { HttpError, createError } from "@middy/util";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { checkAuthHeader } from "./auth";
import { applicationLogger } from "./logging";

type MiddlewareOptions = { eventSchema?: any; requiresAuth?: boolean };

/**
 * Just used to ease testing
 */
type NamedMiddleware = middy.MiddlewareObj & { name: string };

const logger = applicationLogger;

const buildNamedMiddleware = (
  name: string,
  middleware: middy.MiddlewareObj
): NamedMiddleware => {
  return { ...middleware, name };
};

const errorNameToStatusCodeMapping = {
  InsufficientBalanceError: 409,
  InvalidDataFormat: 403,
  UserNotAuthenticatedError: 401,
};

const customErrorHandler = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const onError: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = (request) => {
    logger.info("Enter customErrorHandler");
    const error = request.error;
    const httpError = request.error as HttpError;
    if (httpError.statusCode) {
      // The error already has a status code
      logger.info("Exit customErrorHandler");
      return;
    }

    let statusCode = 500;
    let errorMsg: string;

    if (error instanceof ApplicationError) {
      // Create custom error
      statusCode = errorNameToStatusCodeMapping[error.errorName] ?? 500;
      errorMsg = error.message;
    }

    request.error = createError(statusCode, errorMsg, {
      cause: error,
      expose: true,
    });
    logger.info("Exit customErrorHandler");
  };

  return {
    onError,
  };
};

const middyfy = (handler: any, options?: MiddlewareOptions) => {
  logger.info("Enter middyfy");
  const middlewares = [
    buildNamedMiddleware("custom-error-handler", customErrorHandler()),
    buildNamedMiddleware("http-header-normalizer", httpHeaderNormalizer()),
    buildNamedMiddleware("http-event-normalizer", httpEventNormalizer()),
    buildNamedMiddleware("middy-json-body-parser", middyJsonBodyParser()),
  ];

  if (options?.requiresAuth) {
    middlewares.push(
      buildNamedMiddleware("check-authorizer", checkAuthHeader())
    );
  }

  if (options?.eventSchema) {
    middlewares.push(
      buildNamedMiddleware(
        "validator",
        validator({ eventSchema: transpileSchema(options.eventSchema) })
      )
    );
  }

  middlewares.unshift(
    buildNamedMiddleware(
      "http-error-handler",
      httpErrorHandler({ logger: (err) => logger.error(err) })
    )
  );
  middlewares.push(buildNamedMiddleware("cors", cors()));

  const result = {
    handler: middy(handler).use(middlewares),
    middlewares,
    options,
  };

  logger.info("Exit middyfy");
  return result;
};

export { customErrorHandler, middyfy };
