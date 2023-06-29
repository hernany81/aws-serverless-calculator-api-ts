import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "@infra/utils/apiGateway";
import {
  addSchema,
  divideSchema,
  multiplySchema,
  squareRootSchema,
  subtractSchema,
} from "./schemas";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { AdditionService } from "@app/usecase/calculator/addition";
import { DivisionService } from "@app/usecase/calculator/division";
import { MultiplicationService } from "@app/usecase/calculator/multiplication";
import { RandomStringService } from "@app/usecase/calculator/randomString";
import { SquareRootService } from "@app/usecase/calculator/squareRoot";
import { SubtractionService } from "@app/usecase/calculator/subtraction";
import { AuthenticationService } from "@infra/service/authentication";
import { getBearerToken } from "@infra/utils/auth";
import { applicationLogger } from "@infra/utils/logging";

type BaseHandlerFactoryParams = {
  authenticationService: AuthenticationService;
};

const logger = applicationLogger;

const getUser = async (
  eventHeaders: APIGatewayProxyEventHeaders,
  authenticationService: AuthenticationService
) => {
  return authenticationService.getUserFromAuthenticationToken(
    getBearerToken(eventHeaders)
  );
};

const getAddHandler = (
  params: BaseHandlerFactoryParams & { additionService: AdditionService }
): ValidatedEventAPIGatewayProxyEvent<typeof addSchema> => {
  return async (event) => {
    logger.info("Enter AddHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.additionService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
      input1: event.body.input1 as string,
      input2: event.body.input2 as string,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit AddHandler");

    return responseBody;
  };
};

const getDivideHandler = (
  params: BaseHandlerFactoryParams & { divisionService: DivisionService }
): ValidatedEventAPIGatewayProxyEvent<typeof divideSchema> => {
  return async (event) => {
    logger.info("Enter DivideHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.divisionService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
      input1: event.body.input1 as string,
      input2: event.body.input2 as string,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit DivideHandler");

    return responseBody;
  };
};

const getMultiplyHandler = (
  params: BaseHandlerFactoryParams & {
    multiplicationService: MultiplicationService;
  }
): ValidatedEventAPIGatewayProxyEvent<typeof multiplySchema> => {
  return async (event) => {
    logger.info("Enter MultiplyHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.multiplicationService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
      input1: event.body.input1 as string,
      input2: event.body.input2 as string,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit MultiplyHandler");

    return responseBody;
  };
};

const getRandomStringHandler = (
  params: BaseHandlerFactoryParams & {
    randomStringService: RandomStringService;
  }
): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return async (event) => {
    logger.info("Enter RandomStringHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.randomStringService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit RandomStringHandler");

    return responseBody;
  };
};

const getSquareRootHandler = (
  params: BaseHandlerFactoryParams & { squareRootService: SquareRootService }
): ValidatedEventAPIGatewayProxyEvent<typeof squareRootSchema> => {
  return async (event) => {
    logger.info("Enter SquareRootHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.squareRootService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
      input1: event.body.input1 as string,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit SquareRootHandler");

    return responseBody;
  };
};

const getSubtractHandler = (
  params: BaseHandlerFactoryParams & { subtractionService: SubtractionService }
): ValidatedEventAPIGatewayProxyEvent<typeof subtractSchema> => {
  return async (event) => {
    logger.info("Enter SubtractHandler");
    const user = await getUser(event.headers, params.authenticationService);

    const result = await params.subtractionService.execute({
      userId: user.id,
      creditBalance: user.creditBalance,
      input1: event.body.input1 as string,
      input2: event.body.input2 as string,
    });
    const responseBody = formatJSONResponse({ ...result });
    logger.info("Exit SubtractHandler");

    return responseBody;
  };
};

export {
  getAddHandler,
  getDivideHandler,
  getMultiplyHandler,
  getRandomStringHandler,
  getSquareRootHandler,
  getSubtractHandler,
};
