const numberAsStringPattern = "^(\\+|-)?\\d{1,20}(\\.\\d{1,20})?$";

const addSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        input1: { type: "string", pattern: numberAsStringPattern },
        input2: { type: "string", pattern: numberAsStringPattern },
      },
      required: ["input1", "input2"],
    },
  },
  required: ["body"],
} as const;

const divideSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        input1: { type: "string", pattern: numberAsStringPattern },
        input2: { type: "string", pattern: numberAsStringPattern },
      },
      required: ["input1", "input2"],
    },
  },
  required: ["body"],
} as const;

const multiplySchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        input1: { type: "string", pattern: numberAsStringPattern },
        input2: { type: "string", pattern: numberAsStringPattern },
      },
      required: ["input1", "input2"],
    },
  },
  required: ["body"],
} as const;

const squareRootSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        input1: { type: "string", pattern: numberAsStringPattern },
      },
      required: ["input1"],
    },
  },
  required: ["body"],
} as const;

const subtractSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        input1: { type: "string", pattern: numberAsStringPattern },
        input2: { type: "string", pattern: numberAsStringPattern },
      },
      required: ["input1", "input2"],
    },
  },
  required: ["body"],
} as const;

export {
  addSchema,
  divideSchema,
  multiplySchema,
  squareRootSchema,
  subtractSchema,
};
