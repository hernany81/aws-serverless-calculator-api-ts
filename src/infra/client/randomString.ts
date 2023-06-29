import { DateProvider } from "@app/utils/common";
import { applicationLogger } from "@infra/utils/logging";
import axios, { AxiosError, AxiosInstance } from "axios";
import dayjs from "dayjs";

const logger = applicationLogger;

class DefaultRandomStringClient implements RandomStringClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      timeout: 30_000,
    });
  }

  async generate(): Promise<string> {
    logger.info("Enter DefaultRandomStringClient.generate");
    const responseContent = (
      await this.axiosInstance.get(`/strings`, {
        params: {
          num: 1,
          len: 8,
          format: "plain",
          digits: "on",
          alphabet: "on",
          upperalpha: "on",
        },
      })
    ).data as string;
    logger.info("Exit DefaultRandomStringClient.generate");
    return responseContent?.trim();
  }

  async checkQuota(): Promise<number> {
    logger.info("Enter DefaultRandomStringClient.checkQuota");
    const result = await this.axiosInstance.get(`/quota`, {
      params: { format: "plain" },
    });
    logger.info("Exit DefaultRandomStringClient.checkQuota");
    return result.data;
  }
}

type CircuitBreakerOptions = {
  // Milliseconds to wait after last error to circuit-close
  millisToClose: number;

  // This will exponentially increment the secondsToClose every time the circuit is closed
  // and an consecutive opened due to continued errors
  waitIncrementFactor: number;

  // Number of consecutive errors to circuit-open
  numberOfErrorsToOpen: number;
};

class CircuitBreakerRandomStringClient implements RandomStringClient {
  private lastError?: Error;
  private lastErrorTime: dayjs.Dayjs;
  private errorsCount = 0;
  private waitTime: number;
  private consecutiveOpenedCount = 0;
  private isCircuitOpen = false;

  constructor(
    private readonly client: RandomStringClient,
    private readonly dateProvider: DateProvider,
    private readonly options: CircuitBreakerOptions
  ) {
    this.waitTime = options.millisToClose;
  }

  async generate(): Promise<string> {
    logger.info("Enter CircuitBreakerRandomStringClient.generate");
    let result: string;
    const canExecuteFlag = this.canExecute();

    if (canExecuteFlag) {
      try {
        result = await this.client.generate();
      } catch (err) {
        await this.handleError(err);
      }
    } else {
      throw this.lastError;
    }

    this.handleSuccess();

    logger.info("Exit CircuitBreakerRandomStringClient.generate");
    return result;
  }

  private canExecute(): boolean {
    logger.debug("Enter CircuitBreakerRandomStringClient.canExecute");
    if (!this.isCircuitOpen) {
      logger.debug("Exit CircuitBreakerRandomStringClient.canExecute -> true");
      return true;
    }

    const now = this.dateProvider.now();
    const lastErrorTimePlusWaitTime = this.lastErrorTime.add(
      this.waitTime,
      "milliseconds"
    );

    if (
      !this.lastErrorTime ||
      lastErrorTimePlusWaitTime.isBefore(now) ||
      lastErrorTimePlusWaitTime.isSame(now)
    ) {
      logger.debug("Exit CircuitBreakerRandomStringClient.canExecute -> true");
      return true;
    }

    logger.debug("Exit CircuitBreakerRandomStringClient.canExecute -> false");
    return false;
  }

  private async handleError(err: AxiosError) {
    logger.debug("Enter CircuitBreakerRandomStringClient.handleError");
    this.errorsCount++;
    this.isCircuitOpen = this.errorsCount >= this.options.numberOfErrorsToOpen;
    this.lastError = err;
    this.lastErrorTime = dayjs(this.dateProvider.now());

    if (this.isCircuitOpen) {
      // circuit was opened
      this.consecutiveOpenedCount++;
      if (this.consecutiveOpenedCount > 1) {
        this.waitTime *= this.options.waitIncrementFactor;
      }
    }

    logger.debug("Exit CircuitBreakerRandomStringClient.handleError");
    throw err;
  }

  private handleSuccess() {
    logger.debug("Enter CircuitBreakerRandomStringClient.handleSuccess");
    this.lastError = null;
    this.lastErrorTime = null;
    this.errorsCount = 0;
    this.isCircuitOpen = false;
    this.consecutiveOpenedCount = 0;
    this.waitTime = this.options.millisToClose;
    logger.debug("Exit CircuitBreakerRandomStringClient.handleSuccess");
  }
}

export { CircuitBreakerRandomStringClient, DefaultRandomStringClient };
