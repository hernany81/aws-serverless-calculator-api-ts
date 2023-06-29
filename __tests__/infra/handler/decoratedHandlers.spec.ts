import { loginSchema } from "@infra/handler/auth/schemas";
import {
  addSchema,
  divideSchema,
  multiplySchema,
  squareRootSchema,
  subtractSchema,
} from "@infra/handler/calculator/schemas";
import {
  getDecoratedAddHandler,
  getDecoratedDeleteOperationRecordHandler,
  getDecoratedDivideHandler,
  getDecoratedListOperationsRecordHandler,
  getDecoratedLoginHandler,
  getDecoratedLogoutHandler,
  getDecoratedMultiplyHandler,
  getDecoratedProfileHandler,
  getDecoratedRandomStringHandler,
  getDecoratedSquareRootHandler,
  getDecoratedSubtractHandler,
} from "@infra/handler/decoratedHandlers";
import {
  deleteSchema,
  listSchema,
} from "@infra/handler/operationrecord/schemas";

describe("Handlers decoration", () => {
  const handlerDecoratorParams = [
    {
      name: "Login",
      factory: () => getDecoratedLoginHandler(() => {}),
      eventSchema: loginSchema,
      requiresAuth: false,
    },
    {
      name: "Logout",
      factory: () => getDecoratedLogoutHandler(() => {}),
    },
    {
      name: "Profile",
      factory: () => getDecoratedProfileHandler(() => {}),
    },
    {
      name: "Add",
      factory: () => getDecoratedAddHandler(() => {}),
      eventSchema: addSchema,
    },
    {
      name: "Divide",
      factory: () => getDecoratedDivideHandler(() => {}),
      eventSchema: divideSchema,
    },
    {
      name: "Multiply",
      factory: () => getDecoratedMultiplyHandler(() => {}),
      eventSchema: multiplySchema,
    },
    {
      name: "Random string",
      factory: () => getDecoratedRandomStringHandler(() => {}),
    },
    {
      name: "Square root",
      factory: () => getDecoratedSquareRootHandler(() => {}),
      eventSchema: squareRootSchema,
    },
    {
      name: "Subtract",
      factory: () => getDecoratedSubtractHandler(() => {}),
      eventSchema: subtractSchema,
    },
    {
      name: "List operation records",
      factory: () => getDecoratedListOperationsRecordHandler(() => {}),
      eventSchema: listSchema,
    },
    {
      name: "Delete operation records",
      factory: () => getDecoratedDeleteOperationRecordHandler(() => {}),
      eventSchema: deleteSchema,
    },
  ];

  test.each(handlerDecoratorParams)(
    "$name handler is correctly decorated",
    ({ factory, eventSchema, requiresAuth }) => {
      // arrange
      // act
      const handler = factory();

      // assert
      if (!eventSchema) {
        expect(handler.options.eventSchema).toBeFalsy();
      } else {
        expect(handler.options.eventSchema).toBe(eventSchema);
      }

      if (requiresAuth ?? true) {
        expect(handler.options.requiresAuth).toBeTruthy();
      } else {
        expect(handler.options.requiresAuth).toBeFalsy();
      }
    }
  );
});
