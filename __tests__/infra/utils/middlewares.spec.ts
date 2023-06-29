import { InsufficientBalanceError, InvalidDataFormat } from "@app/utils/common";
import { addSchema } from "@infra/handler/calculator/schemas";
import { UserNotAuthenticatedError } from "@infra/service/authentication";
import { customErrorHandler, middyfy } from "@infra/utils/middlewares";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";

describe("middyfy function", () => {
  test("Build correctly the middlewares pipe [1]", () => {
    // arrange
    // act
    const result = middyfy(() => {}, {
      eventSchema: addSchema,
      requiresAuth: true,
    });

    // assert
    expect(result.middlewares.map((x) => x.name)).toEqual([
      "http-error-handler",
      "custom-error-handler",
      "http-header-normalizer",
      "http-event-normalizer",
      "middy-json-body-parser",
      "check-authorizer",
      "validator",
      "cors",
    ]);
    expect(result.options.eventSchema).toEqual(addSchema);
    expect(result.options.requiresAuth).toBeTruthy();
  });

  test("Build correctly the middlewares pipe [2]", () => {
    // arrange
    // act
    const result = middyfy(() => {});

    // assert
    expect(result.middlewares.map((x) => x.name)).toEqual([
      "http-error-handler",
      "custom-error-handler",
      "http-header-normalizer",
      "http-event-normalizer",
      "middy-json-body-parser",
      "cors",
    ]);
    expect(result.options).toBeFalsy();
  });
});

describe("CustomErrorHandler middleware", () => {
  const errorParams = [
    {
      trigger: () => {
        throw new InsufficientBalanceError("Balance too low");
      },
      statusCode: 409,
    },
    {
      trigger: () => {
        throw new InvalidDataFormat("Bad format");
      },
      statusCode: 403,
    },
    {
      trigger: () => {
        throw new UserNotAuthenticatedError("Not authenticated");
      },
      statusCode: 401,
    },
    {
      trigger: () => {
        throw new Error("Generic error");
      },
      statusCode: 500,
    },
  ];

  test.each(errorParams)(
    "Application error is properly translated to HTTP status code",
    async ({ trigger, statusCode }) => {
      // arrange
      const handler = middy(async () => trigger()).use([
        httpErrorHandler(),
        customErrorHandler(),
      ]);

      const event =
        generateApiGatewayProxyEvent() as unknown as APIGatewayProxyEvent;

      const context = generateApiGatewayContext();

      // act
      // await expect(handler(event, context)).rejects.toThrow("Boom!");
      const response = (await handler(
        event,
        context
      )) as unknown as APIGatewayProxyResult;
      expect(response.statusCode).toEqual(statusCode);
    }
  );
});
