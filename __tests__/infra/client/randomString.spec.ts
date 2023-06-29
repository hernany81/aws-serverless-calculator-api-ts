import { DateProvider } from "@app/utils/common";
import {
  CircuitBreakerRandomStringClient,
  DefaultRandomStringClient,
} from "@infra/client/randomString";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import nock from "nock";

const FAKE_BASE_URL = "http://a-dummy-url-that-not-exists";

axios.defaults.adapter = "http";

const invokeAndSwallowError = async (handler: () => Promise<any>) => {
  try {
    await handler();
  } catch (error) {
    // do nothing
  }
};

describe("DefaultRandomStringClient", () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  // This might be useful just for triage scenarios
  test.skip("Generate random string (real impl)", async () => {
    // arrange
    const client = new DefaultRandomStringClient("https://www.random.org");

    // act
    const result = await client.generate();

    // assert
    expect(result).not.toBeFalsy();
    expect(result.length).toBeGreaterThanOrEqual(8);
  });

  // This might be useful just for triage scenarios
  test.skip("Check quota (real impl)", async () => {
    // arrange
    const client = new DefaultRandomStringClient("https://www.random.org");

    // act
    const result = await client.checkQuota();

    // assert
    expect(result).not.toBeFalsy();
    expect(result).toBeGreaterThanOrEqual(0);
  });

  test("Generate random string - successfully", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .get("/strings")
      .query({
        num: 1,
        len: 8,
        format: "plain",
        digits: "on",
        alphabet: "on",
        upperalpha: "on",
      })
      .reply(200, "ABCDEF");
    const client = new DefaultRandomStringClient(FAKE_BASE_URL);

    // act
    const result = await client.generate();

    // assert
    expect(result).toEqual("ABCDEF");
    scope.done();
  });

  test("Generate random string - 503 service not available", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .get("/strings")
      .query(true)
      .reply(503, "Error: Boom!");
    const client = new DefaultRandomStringClient(FAKE_BASE_URL);

    // act
    try {
      await client.generate();
    } catch (err) {
      expect(err).toBeInstanceOf(AxiosError);

      const axiosError = err as AxiosError;
      expect(axiosError.response.status).toBe(503);
    }

    scope.done();
  });

  test("Check quota - successfully", async () => {
    // arrange
    const scope = nock(FAKE_BASE_URL)
      .get("/quota")
      .query({ format: "plain" })
      .reply(200, "123456");
    const client = new DefaultRandomStringClient(FAKE_BASE_URL);

    // act
    const result = await client.checkQuota();

    // assert
    expect(result).toEqual(123456);
    scope.done();
  });
});

describe("CircuitBreakerRandomStringClient", () => {
  const randomStringClient: RandomStringClient = {
    generate: jest.fn(),
  };

  const generateRandomCallMock = jest.mocked(randomStringClient.generate);

  const dateProvider: DateProvider = {
    now: jest.fn(),
  };

  const getNowCallMock = jest.mocked(dateProvider.now);

  const setCurrentTimeMock = (date: string | dayjs.Dayjs | Date) => {
    let toSet: Date;
    if (date instanceof Date) {
      toSet = date;
    } else if (dayjs.isDayjs(date)) {
      toSet = date.toDate();
    } else {
      toSet = new Date(date);
    }

    getNowCallMock.mockReturnValue(toSet);
  };

  test("Can make errored requests till max allowed errors hit", async () => {
    // arrange
    const client = new CircuitBreakerRandomStringClient(
      randomStringClient,
      dateProvider,
      { numberOfErrorsToOpen: 3, millisToClose: 5000, waitIncrementFactor: 1.2 }
    );
    generateRandomCallMock.mockRejectedValue(new AxiosError());
    setCurrentTimeMock("2023-06-13T10:30:00");

    // act
    for (let i = 0; i < 5; i++) {
      await invokeAndSwallowError(() => client.generate());
    }

    // assert
    expect(generateRandomCallMock).toHaveBeenCalledTimes(3);
  });

  test("If circuit-open then requests are skipped till wait time", async () => {
    // arrange
    const client = new CircuitBreakerRandomStringClient(
      randomStringClient,
      dateProvider,
      { numberOfErrorsToOpen: 3, millisToClose: 5000, waitIncrementFactor: 1.2 }
    );
    generateRandomCallMock.mockRejectedValue(new AxiosError());
    setCurrentTimeMock("2023-06-13T10:30:00");

    for (let i = 0; i < 3; i++) {
      await invokeAndSwallowError(() => client.generate());
    }

    generateRandomCallMock.mockClear();
    generateRandomCallMock.mockResolvedValue("this-is-a-random-string");
    const baseDate = dayjs("2023-06-13T10:30:00");

    // act
    for (let i = 0; i < 4; i++) {
      setCurrentTimeMock(baseDate.add(i + 1, "seconds"));
      await invokeAndSwallowError(() => client.generate());
    }

    setCurrentTimeMock("2023-06-13T10:30:05");
    const value = await client.generate();

    // assert
    expect(value).toEqual("this-is-a-random-string");
    expect(generateRandomCallMock).toHaveBeenCalledTimes(1);
  });

  test("If circuit-open and wait time elapsed a subsequent request error increments wait time exponentially", async () => {
    // arrange
    const client = new CircuitBreakerRandomStringClient(
      randomStringClient,
      dateProvider,
      { numberOfErrorsToOpen: 1, millisToClose: 5000, waitIncrementFactor: 2 }
    );
    generateRandomCallMock.mockRejectedValue(new AxiosError());
    getNowCallMock.mockReturnValue(new Date("2023-06-13T10:30:00"));

    // act & assert

    // should fail but trigger request
    await invokeAndSwallowError(() => client.generate());
    expect(generateRandomCallMock).toHaveBeenCalledTimes(1);

    // now in circuit-open state, invoking after "waitTime" should trigger request and fail. This updates the waitTime to 10 secs (5 sec * 2), circuit will close at 10:30:15
    generateRandomCallMock.mockClear();
    setCurrentTimeMock("2023-06-13T10:30:05");
    await expect(client.generate()).rejects.toThrow();
    expect(generateRandomCallMock).toHaveBeenCalled();

    // this is executed still with circuit-open state
    generateRandomCallMock.mockClear();
    setCurrentTimeMock("2023-06-13T10:30:14");
    await expect(client.generate()).rejects.toThrow();
    expect(generateRandomCallMock).not.toHaveBeenCalled();

    // this is executed within circuit-close state. This call updates the waitTime to 20 secs (10 sec * 2), circuit will close at 10:30:35
    generateRandomCallMock.mockClear();
    setCurrentTimeMock("2023-06-13T10:30:15");
    await expect(client.generate()).rejects.toThrow();
    expect(generateRandomCallMock).toHaveBeenCalled();

    // this is executed still with circuit-open state
    generateRandomCallMock.mockClear();
    setCurrentTimeMock("2023-06-13T10:30:34.999");
    await expect(client.generate()).rejects.toThrow();
    expect(generateRandomCallMock).not.toHaveBeenCalled();

    // this is executed within circuit-close state. This call updates the waitTime to 20 secs (10 sec * 2), circuit will close at 10:30:35
    generateRandomCallMock.mockClear();
    setCurrentTimeMock("2023-06-13T10:30:35");
    await expect(client.generate()).rejects.toThrow();
    expect(generateRandomCallMock).toHaveBeenCalled();
  });
});
