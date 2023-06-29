import { OperationRecordId } from "@app/entity/operationRecord";
import { User, UserId, UserStatus } from "@app/entity/user";
import {
  getDeleteHandler,
  getListHandler,
} from "@infra/handler/operationrecord/handlers";
import {
  deleteSchema,
  listSchema,
} from "@infra/handler/operationrecord/schemas";
import { ValidatedAPIGatewayProxyEvent } from "@infra/utils/apiGateway";
import { APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";
import {
  getDeleteOperationRecordServiceMock,
  getListOperationRecordsServiceMock,
} from "../../app/appMocks";
import { getAuthenticationServiceMock } from "../infraMocks";
import {
  generateApiGatewayContext,
  generateApiGatewayProxyEvent,
} from "../infraUtils";
import { createOperationRecord } from "../utils/entityGenerator";

describe("Operation Records handlers", () => {
  const authenticationService = getAuthenticationServiceMock();

  test("List handler - successful", async () => {
    // arrange
    const loggedUser = User.for({
      id: UserId.for(randomUUID()),
      name: "John Doe",
      passwordHash: randomUUID(),
      status: UserStatus.ACTIVE,
      creditBalance: 100,
    });
    jest
      .mocked(authenticationService.getUserFromAuthenticationToken)
      .mockResolvedValue(loggedUser);
    const listService = getListOperationRecordsServiceMock();
    const listHandler = getListHandler({
      authenticationService,
      listService,
    });
    const record = createOperationRecord();
    jest.mocked(listService.execute).mockResolvedValue({
      pageNumber: 12,
      pageSize: 5,
      totalResults: 63,
      totalPages: 5,
      result: [record],
    });

    const event = {
      ...generateApiGatewayProxyEvent(),
      queryStringParameters: {
        pageNumber: "1",
        pageSize: "5",
        sortField: "createdDate",
        sortOrder: "asc",
        operationType: "ADDITION",
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof listSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await listHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(JSON.parse(resp.body)).toEqual({
      pageNumber: 12,
      pageSize: 5,
      totalResults: 63,
      totalPages: 5,
      result: [
        {
          cost: record.cost,
          createdAt: record.createdAt.toISOString(),
          operationId: record.operationId.value,
          operationInput: record.operationInput,
          operationResult: record.operationResult,
          type: record.type,
          userBalance: record.userBalance,
          userId: record.userId.value,
        },
      ],
    });
    expect(jest.mocked(listService.execute)).toHaveBeenCalledWith({
      pageNumber: 1,
      pageSize: 5,
      sortField: "createdDate",
      sortOrder: "asc",
      operationType: "ADDITION",
      userId: loggedUser.id,
      inputContains: undefined,
      outputContains: undefined,
    });
  });

  test("Delete handler - successful", async () => {
    // arrange
    const deleteService = getDeleteOperationRecordServiceMock();
    const deleteHandler = getDeleteHandler({
      deleteService,
    });

    const operationRecordId = randomUUID();
    const event = {
      ...generateApiGatewayProxyEvent(),
      pathParameters: {
        id: operationRecordId,
      },
    } as unknown as ValidatedAPIGatewayProxyEvent<typeof deleteSchema>;

    const context = generateApiGatewayContext();

    // act
    const resp = (await deleteHandler(
      event,
      context,
      null
    )) as APIGatewayProxyResult;

    // assert
    expect(resp.statusCode).toBe(200);
    expect(resp.body).toBeNull();
    expect(jest.mocked(deleteService.execute)).toHaveBeenCalledWith(
      OperationRecordId.for(operationRecordId)
    );
  });
});
