import { AuthenticationService } from "@infra/service/authentication";
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "@infra/utils/apiGateway";
import { getBearerToken } from "@infra/utils/auth";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { loginSchema } from "./schemas";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

const getLoginHandler = (
  authenticationService: AuthenticationService
): ValidatedEventAPIGatewayProxyEvent<typeof loginSchema> => {
  return async (event) => {
    logger.info("Enter LoginHandler");
    const token = await authenticationService.login(
      event.body.username as string,
      event.body.password as string
    );
    const responseBody = formatJSONResponse({ token });

    logger.info("Exit LoginHandler");
    return responseBody;
  };
};

const getLogoutHandler = (
  authenticationService: AuthenticationService
): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return async (event) => {
    logger.info("Enter LogoutHandler");
    const bearerToken = getBearerToken(event.headers);
    await authenticationService.logout(bearerToken);
    const responseBody = formatJSONResponse();

    logger.info("Exit LogoutHandler");
    return responseBody;
  };
};

export { getLoginHandler, getLogoutHandler };
