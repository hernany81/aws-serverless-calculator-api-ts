import { User, UserId, UserStatus } from "@app/entity/user";
import { getProfileHandler } from "@infra/handler/profile/handlers";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAuthenticationServiceMock } from "../infraMocks";
import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";

test("Profile handler - successful", async () => {
  // arrange
  const authenticationService = getAuthenticationServiceMock();
  jest
    .mocked(authenticationService.getUserFromAuthenticationToken)
    .mockResolvedValue(
      User.for({
        id: UserId.for(""),
        name: "John",
        passwordHash: "pass-hash",
        status: UserStatus.ACTIVE,
        creditBalance: 33.33,
      })
    );
  const profileHandler = getProfileHandler(authenticationService);

  const event = {
    ...generateApiGatewayProxyEvent(),
  } as unknown as APIGatewayProxyEvent;

  const context = generateApiGatewayContext();

  // act
  const resp = (await profileHandler(
    event,
    context,
    null
  )) as APIGatewayProxyResult;

  // assert
  expect(resp.statusCode).toBe(200);
  expect(resp.body).toBe(
    JSON.stringify({ name: "John", creditBalance: 33.33 })
  );
});
