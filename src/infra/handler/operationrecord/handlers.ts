import { OperationType } from "@app/entity/operation";
import { OperationRecordId } from "@app/entity/operationRecord";
import { DeleteOperationRecordService } from "@app/usecase/operationrecord/delete";
import {
  ListOperationRecordSortableFields,
  ListOperationRecordsService,
  SortingOrder,
} from "@app/usecase/operationrecord/list";
import { AuthenticationService } from "@infra/service/authentication";
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "@infra/utils/apiGateway";
import { getBearerToken } from "@infra/utils/auth";
import { APIGatewayProxyEventHeaders } from "aws-lambda";
import { deleteSchema, listSchema } from "./schemas";
import { applicationLogger } from "@infra/utils/logging";

const logger = applicationLogger;

const getUser = async (
  eventHeaders: APIGatewayProxyEventHeaders,
  authenticationService: AuthenticationService
) => {
  return authenticationService.getUserFromAuthenticationToken(
    getBearerToken(eventHeaders)
  );
};

const getListHandler = (params: {
  authenticationService: AuthenticationService;
  listService: ListOperationRecordsService;
}): ValidatedEventAPIGatewayProxyEvent<typeof listSchema> => {
  return async (event) => {
    logger.info("Enter ListOperationRecordsHandler");
    const user = await getUser(event.headers, params.authenticationService);
    const result = await params.listService.execute({
      pageNumber: Math.max(parseInt(event.queryStringParameters.pageNumber), 1),
      pageSize: Math.max(parseInt(event.queryStringParameters.pageSize), 5),
      sortField:
        (event.queryStringParameters
          .sortField as ListOperationRecordSortableFields) ?? "createdDate",
      sortOrder:
        (event.queryStringParameters.sortOrder as SortingOrder) ?? "desc",
      userId: user.id,
      operationType: event.queryStringParameters.operationType as OperationType,
      inputContains: event.queryStringParameters.inputContains,
      outputContains: event.queryStringParameters.outputContains,
    });

    const serializedResult = {
      ...result,
      result: result.result.map((x) => {
        return {
          cost: x.cost,
          createdAt: x.createdAt,
          id: x.id?.value,
          operationId: x.operationId?.value,
          operationInput: x.operationInput,
          operationResult: x.operationResult,
          type: x.type,
          userBalance: x.userBalance,
          userId: x.userId?.value,
        };
      }),
    };
    const responseBody = formatJSONResponse(serializedResult);
    logger.info("Exit ListOperationRecordsHandler");

    return responseBody;
  };
};

const getDeleteHandler = (params: {
  deleteService: DeleteOperationRecordService;
}): ValidatedEventAPIGatewayProxyEvent<typeof deleteSchema> => {
  return async (event) => {
    logger.info("Enter DeleteOperationRecordHandler");
    const operationRecordId = OperationRecordId.for(event.pathParameters.id);
    await params.deleteService.execute(operationRecordId);
    const responseBody = formatJSONResponse();
    logger.info("Exit DeleteOperationRecordHandler");

    return responseBody;
  };
};

export { getDeleteHandler, getListHandler };
