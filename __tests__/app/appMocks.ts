import { User, UserId, UserStatus } from "@app/entity/user";
import { OperationRecordRepository } from "@app/repository/operationRecordRepository";
import { OperationRepository } from "@app/repository/operationRepository";
import { UserRepository } from "@app/repository/userRepository";
import { AdditionService } from "@app/usecase/calculator/addition";
import { DivisionService } from "@app/usecase/calculator/division";
import { MultiplicationService } from "@app/usecase/calculator/multiplication";
import { RandomStringService } from "@app/usecase/calculator/randomString";
import { SquareRootService } from "@app/usecase/calculator/squareRoot";
import { SubtractionService } from "@app/usecase/calculator/subtraction";
import { DeleteOperationRecordService } from "@app/usecase/operationrecord/delete";
import { ListOperationRecordsService } from "@app/usecase/operationrecord/list";
import { DateProvider, NumberConversion } from "@app/utils/common";
import { randomUUID } from "crypto";

function getOperationRepositoryMock(): OperationRepository {
  return {
    findByOperationType: jest.fn(),
  };
}

function getOperationRecordRepositoryMock(): OperationRecordRepository {
  return {
    save: jest.fn(),
    delete: jest.fn(),
    list: jest.fn(),
  };
}

function getDateProviderMock(): DateProvider {
  return {
    now: jest.fn(),
  };
}

function getNumberConversionMock(): NumberConversion {
  return {
    getDecimals: jest.fn(),
  };
}

function getAdditionServiceMock(): AdditionService {
  return {
    execute: jest.fn((params) => {
      return Promise.resolve({
        result: `add: ${params.input1} and ${params.input2}`,
        creditBalance: 99,
      });
    }),
  };
}

function getDivisionServiceMock(): DivisionService {
  return {
    execute: jest.fn((params) => {
      return Promise.resolve({
        result: `divide: ${params.input1} and ${params.input2}`,
        creditBalance: 98,
      });
    }),
  };
}

function getMultiplicationServiceMock(): MultiplicationService {
  return {
    execute: jest.fn((params) => {
      return Promise.resolve({
        result: `multiply: ${params.input1} and ${params.input2}`,
        creditBalance: 97,
      });
    }),
  };
}

function getRandomStringServiceMock(): RandomStringService {
  return {
    execute: jest.fn((_) => {
      return Promise.resolve({ result: `random-string`, creditBalance: 96 });
    }),
  };
}

function getSquareRootService(): SquareRootService {
  return {
    execute: jest.fn((params) => {
      return Promise.resolve({
        result: `square root: ${params.input1}`,
        creditBalance: 95,
      });
    }),
  };
}

function getSubtractionServiceMock(): SubtractionService {
  return {
    execute: jest.fn((params) => {
      return Promise.resolve({
        result: `subtract: ${params.input1} and ${params.input2}`,
        creditBalance: 94,
      });
    }),
  };
}

function getUserRepositoryMock(): UserRepository {
  return {
    findById: jest.fn(async (id) =>
      User.for({
        id,
        name: "John Doe",
        passwordHash: "xxxx",
        status: UserStatus.ACTIVE,
        creditBalance: 100,
      })
    ),
    findByName: jest.fn(async (name) =>
      User.for({
        id: UserId.for(randomUUID()),
        name,
        passwordHash: "xxxx",
        status: UserStatus.ACTIVE,
        creditBalance: 100,
      })
    ),
    updateUserBalance: jest.fn(() => Promise.resolve(98)),
  };
}

function getListOperationRecordsServiceMock(): ListOperationRecordsService {
  return {
    execute: jest.fn(),
  };
}

function getDeleteOperationRecordServiceMock(): DeleteOperationRecordService {
  return {
    execute: jest.fn(),
  };
}

export {
  getAdditionServiceMock,
  getDateProviderMock,
  getDeleteOperationRecordServiceMock,
  getDivisionServiceMock,
  getListOperationRecordsServiceMock,
  getMultiplicationServiceMock,
  getNumberConversionMock,
  getOperationRecordRepositoryMock,
  getOperationRepositoryMock,
  getRandomStringServiceMock,
  getSquareRootService,
  getSubtractionServiceMock,
  getUserRepositoryMock,
};
