import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";
import {
  getLoginHandler,
  getLogoutHandler,
} from "@infra/handler/auth/handlers";
import { getAuthenticationServiceMock } from "../infraMocks";
import { ValidatedAPIGatewayProxyEvent } from "@infra/utils/apiGateway";
import { loginSchema } from "@infra/handler/auth/schemas";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

describe("Auth handlers", () => {
  const authenticationService = getAuthenticationServiceMock();

  test("Login handler - successful", async () => {
    // arrange
    const loginHandler = getLoginHandler(authenticationService);
    const loginCallMock = jest.mocked(authenticationService.login);
    loginCallMock.mockResolvedValue("top-secret-bearer-token");
    const event = {
      ...generateApiGatewayProxyEvent(),
      body: {
        username: "Will",
        password: "Smith",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof loginSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await loginHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBe(
      JSON.stringify({ token: "top-secret-bearer-token" })
    );
    expect(loginCallMock).toHaveBeenCalled();
    const loginServiceInvocationParams = loginCallMock.mock.calls[0];
    expect(loginServiceInvocationParams[0]).toEqual("Will");
    expect(loginServiceInvocationParams[1]).toEqual("Smith");
  });

  test("Logout handler - successful", async () => {
    // arrange
    const logoutHandler = getLogoutHandler(authenticationService);
    const logoutCallMock = jest.mocked(authenticationService.logout);
    const event = {
      ...generateApiGatewayProxyEvent(),
      headers: {
        authorization: "Bearer abcdefgh",
      },
    } as unknown as APIGatewayProxyEvent;

    const context = generateApiGatewayContext();

    // act
    const resp = (await logoutHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeNull();
    expect(logoutCallMock).toHaveBeenCalled();
    const logoutCallParams = logoutCallMock.mock.calls[0];
    expect(logoutCallParams[0]).toEqual("abcdefgh");
  });

  test("Logout handler - no bearer token provided", async () => {
    // arrange
    const logoutHandler = getLogoutHandler(authenticationService);
    const logoutCallMock = jest.mocked(authenticationService.logout);
    const event = {
      ...generateApiGatewayProxyEvent(),
    } as unknown as APIGatewayProxyEvent;

    const context = generateApiGatewayContext();

    // act
    const resp = (await logoutHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeNull();
    expect(logoutCallMock).toHaveBeenCalled();
    const logoutCallParams = logoutCallMock.mock.calls[0];
    expect(logoutCallParams[0]).toEqual("");
  });
});
