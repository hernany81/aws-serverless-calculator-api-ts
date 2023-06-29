import { AuthenticationService } from "@infra/service/authentication";
import { formatJSONResponse } from "@infra/utils/apiGateway";
import { getBearerToken } from "@infra/utils/auth";
import { applicationLogger } from "@infra/utils/logging";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";

const logger = applicationLogger;

const getProfileHandler = (
  authenticationService: AuthenticationService
): Handler<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  return async (event) => {
    logger.info("Enter getProfileHandler");
    const { name, creditBalance } =
      await authenticationService.getUserFromAuthenticationToken(
        getBearerToken(event.headers)
      );
    const responseBody = formatJSONResponse({ name, creditBalance });
    logger.info("Exit getProfileHandler");

    return responseBody;
  };
};

export { getProfileHandler };
