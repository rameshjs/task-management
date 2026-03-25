import { StatusCodes } from "http-status-codes";

export class ServiceResponse<T = null> {
  readonly success: boolean;
  readonly message: string;
  readonly data: T;
  readonly statusCode: number;

  private constructor(success: boolean, message: string, data: T, statusCode: number) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(message: string, data: T, statusCode: number = StatusCodes.OK) {
    return new ServiceResponse(true, message, data, statusCode);
  }

  static failure<T = null>(message: string, data: T = null as T, statusCode: number = StatusCodes.BAD_REQUEST) {
    return new ServiceResponse(false, message, data, statusCode);
  }
}
