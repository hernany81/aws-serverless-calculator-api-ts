import middy from "@middy/core";
import { createError } from "@middy/util";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyResult,
} from "aws-lambda";

const getBearerToken = (headers: APIGatewayProxyEventHeaders): string =>
  headers["authorization"]?.trim()?.replace(/bearer\s*/i, "") ?? "";

const checkAuthHeader = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const before: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = (request) => {
    const authorizationHeader = request.event.headers["authorization"];

    if (
      !authorizationHeader ||
      !/^bearer\s+.+$/i.test(authorizationHeader.trim())
    ) {
      throw createError(
        401,
        "User didn't provide a valid authorization header",
        { cause: `header value: ${authorizationHeader}` }
      );
    }
  };

  return {
    before,
  };
};

export { getBearerToken, checkAuthHeader };
