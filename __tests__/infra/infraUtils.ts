import { APIGatewayProxyEvent, Context } from "aws-lambda";

function generateApiGatewayProxyEvent(hasJSON: boolean = true) {
  const event: Omit<APIGatewayProxyEvent, "body"> = {
    headers: {},
    multiValueHeaders: undefined,
    httpMethod: "",
    isBase64Encoded: false,
    path: "",
    pathParameters: undefined,
    queryStringParameters: undefined,
    multiValueQueryStringParameters: undefined,
    stageVariables: undefined,
    requestContext: undefined,
    resource: "",
  };

  if (hasJSON) {
    event.headers["Content-Type"] = "application/json";
  }

  return event;
}

const generateApiGatewayContext = () => {
  const context: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis: () => 1000,
    done: function (error?: Error, result?: any): void {
      throw new Error(`Function not implemented. ${error} - ${result}`);
    },
    fail: function (error: string | Error): void {
      throw new Error(`Function not implemented. ${error}`);
    },
    succeed: function (messageOrObject: any): void {
      throw new Error(`Function not implemented. ${messageOrObject}`);
    },
  };

  return context;
};

export { generateApiGatewayContext, generateApiGatewayProxyEvent };
