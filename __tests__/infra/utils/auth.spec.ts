import { checkAuthHeader } from "@infra/utils/auth";
import middy from "@middy/core";
import { HttpError } from "@middy/util";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";

describe("checkAuthHeader middleware", () => {
  const invalidValuesParams = [null, "", "Bearer", "Beare aaa", "xxx"];

  test.each(invalidValuesParams)(
    "Invalid authorization header values",
    async (authorizationValue) => {
      // arrange
      const handler = middy(() => {}).use(checkAuthHeader());
      const event = {
        ...generateApiGatewayProxyEvent(),
        headers: {
          authorization: authorizationValue,
        },
      } as unknown as APIGatewayProxyEvent;
      const context = generateApiGatewayContext();

      // act & assert
      await expect(handler(event, context)).rejects.toMatchObject<
        Partial<HttpError>
      >({
        statusCode: 401,
        message: "User didn't provide a valid authorization header",
      });
    }
  );

  test("Missing Authorization header", async () => {
    // arrange
    const handler = middy(() => {}).use(checkAuthHeader());
    const event = {
      ...generateApiGatewayProxyEvent(),
    } as unknown as APIGatewayProxyEvent;
    const context = generateApiGatewayContext();

    // act & assert
    await expect(handler(event, context)).rejects.toMatchObject<
      Partial<HttpError>
    >({
      statusCode: 401,
      message: "User didn't provide a valid authorization header",
    });
  });

  test("Valid Authorization header", async () => {
    // arrange
    const handler = middy(async () => {
      return { statusCode: 200 };
    }).use(checkAuthHeader());
    const event = {
      ...generateApiGatewayProxyEvent(),
      headers: {
        authorization: "bearer xxxxxxx",
      },
    } as unknown as APIGatewayProxyEvent;
    const context = generateApiGatewayContext();

    // act & assert
    await expect(
      handler(event, context) as Promise<APIGatewayProxyResult>
    ).resolves.toMatchObject<Partial<APIGatewayProxyResult>>({
      statusCode: 200,
    });
  });
});
