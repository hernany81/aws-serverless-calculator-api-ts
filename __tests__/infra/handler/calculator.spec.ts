import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";

import {
  getAddHandler,
  getDivideHandler,
  getMultiplyHandler,
  getRandomStringHandler,
  getSquareRootHandler,
  getSubtractHandler,
} from "@infra/handler/calculator/handlers";
import {
  addSchema,
  divideSchema,
  multiplySchema,
  squareRootSchema,
  subtractSchema,
} from "@infra/handler/calculator/schemas";
import { ValidatedAPIGatewayProxyEvent } from "@infra/utils/apiGateway";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  getAdditionServiceMock,
  getDivisionServiceMock,
  getMultiplicationServiceMock,
  getRandomStringServiceMock,
  getSquareRootService,
  getSubtractionServiceMock,
} from "../../app/appMocks";
import { getAuthenticationServiceMock } from "../infraMocks";

describe("Calculator handlers", () => {
  const authenticationService = getAuthenticationServiceMock();

  test("Add handler - successful", async () => {
    // arrange
    const additionService = getAdditionServiceMock();
    const addHandler = getAddHandler({
      additionService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
        input2: "-4",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof addSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await addHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "add: 5.5 and -4", creditBalance: 99 })
    );
  });

  test("Divide handler - successful", async () => {
    // arrange
    const divisionService = getDivisionServiceMock();
    const divideHandler = getDivideHandler({
      divisionService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
        input2: "-4",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof divideSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await divideHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "divide: 5.5 and -4", creditBalance: 98 })
    );
  });

  test("Multiply handler - successful", async () => {
    // arrange
    const multiplicationService = getMultiplicationServiceMock();
    const multiplyHandler = getMultiplyHandler({
      multiplicationService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
        input2: "-4",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof multiplySchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await multiplyHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "multiply: 5.5 and -4", creditBalance: 97 })
    );
  });

  test("Subtract handler - successful", async () => {
    // arrange
    const subtractionService = getSubtractionServiceMock();
    const subtractHandler = getSubtractHandler({
      subtractionService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
        input2: "-4",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof subtractSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await subtractHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "subtract: 5.5 and -4", creditBalance: 94 })
    );
  });

  test("Square root handler - successful", async () => {
    // arrange
    const squareRootService = getSquareRootService();
    const squareRootHandler = getSquareRootHandler({
      squareRootService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof squareRootSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await squareRootHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "square root: 5.5", creditBalance: 95 })
    );
  });

  test("Random string handler - successful", async () => {
    // arrange
    const randomStringService = getRandomStringServiceMock();
    const randomStringHandler = getRandomStringHandler({
      randomStringService,
      authenticationService,
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        input1: "5.5",
        input2: "-4",
      },
    } as unknown as APIGatewayProxyEvent;

    const context = generateApiGatewayContext();

    // act
    const resp = (await randomStringHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ result: "random-string", creditBalance: 96 })
    );
  });
});
