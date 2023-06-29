import { OperationType } from "@app/entity/operation";

const listSchema = {
  type: "object",
  properties: {
    queryStringParameters: {
      type: "object",
      properties: {
        pageNumber: {
          type: "integer",
        },
        pageSize: {
          type: "integer",
        },
        sortField: {
          type: "string",
          enum: ["type", "result", "createdDate"],
        },
        sortOrder: {
          type: "string",
          enum: ["asc", "desc"],
        },
        operationType: {
          type: "string",
          enum: Object.values(OperationType),
        },
        inputContains: {
          type: "string",
        },
        outputContains: {
          type: "string",
        },
      },
    },
  },
} as const;

const deleteSchema = {
  type: "object",
  properties: {
    pathParameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
      },
      required: ["id"],
    },
  },
  required: ["pathParameters"],
} as const;

export { deleteSchema, listSchema };
