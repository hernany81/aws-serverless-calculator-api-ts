/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/src/app/$1",
    "@infra/(.*)": "<rootDir>/src/infra/$1",
  },
  testRegex: "__tests__/.*\\.spec\\.ts",
};
