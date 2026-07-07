import { ClStringHelper } from '@monorepo/core-lib';
import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { BlApiError } from '../models/bl-nest-api-error.class';
import { BlTranslateService } from '../modules/bl-translate/bl-translate.service';
import { BlTranslateOptions } from '../modules/bl-translate/bl-translate-options.class';
import { BlHttpException } from './bl-http.exception';
import { blIsTransientDbError } from './bl-transient-db-error.helper';

export interface BlCoreExceptionHandlerFilterOptions {
  isProduction: boolean;
  errorColumnToLong: string;
  serverError: string;
}

/**
 * Class to catch all exception and translate it if possible
 */
export abstract class BlCoreExceptionHandlerFilter implements ExceptionFilter {
  protected readonly logger = new Logger(BlCoreExceptionHandlerFilter.name);

  protected constructor(
    private readonly translateService: BlTranslateService,
    private options: BlCoreExceptionHandlerFilterOptions
  ) {}

  protected abstract logUnknownError(error: Error, instanceId: string): void;

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const response: Response = host.switchToHttp().getResponse();
    try {
      const error: BlApiError = await this.handleError(exception as any);

      response.status(error.status).json(error);
    } catch (e: any) {
      const instanceId: string = ClStringHelper.generateUUID();
      // use catch error if an error is raised in handleError method
      // because it would break the app
      this.logger.error(
        `Unexpected error thrown in CustomExceptionHandlerFilter | InstanceId ${instanceId} | Error : ${e}`
      );
      if (e.stack) {
        this.logger.error(e.stack);
      }
      const error: BlApiError = {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        detail: 'Server error',
        code: this.options.serverError,
        instanceId: instanceId,
      };
      response.status(error.status).json(error);
    }
  }

  private async handleError(error: Error): Promise<BlApiError> {
    if (error instanceof BlHttpException) {
      return this.handleKnownException(error);
    } else if (error instanceof HttpException) {
      return this.handleNestHttpException(error);
    } else if (error instanceof QueryFailedError && (error as any).code === 'ER_DATA_TOO_LONG') {
      return this.handleDataTooLongException(error);
    } else if (blIsTransientDbError(error)) {
      return this.handleTransientDbException(error);
    } else {
      return this.handleUnknownException(error);
    }
  }

  /**
   * Handle a transient database connection error (e.g. a pooled
   * connection closed by the server/proxy while idle). The full error
   * is logged for diagnosis, but the client only gets a generic 500
   * with no connection detail leaked.
   */
  private handleTransientDbException(error: Error): BlApiError {
    const instanceId: string = ClStringHelper.generateUUID();

    // log the full error for diagnosis (message + stack)
    this.logUnknownError(error, instanceId);

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: this.options.serverError,
      instanceId: instanceId,
    };
  }

  private handleKnownException(error: BlHttpException): Promise<BlApiError> {
    // translate the error message and throw the exception with error code and message
    return this.convertToNestError(
      error.message,
      error.getStatus(),
      { args: error.customOptions.detailArgs },
      error.customOptions.instanceId
    );
  }

  private handleNestHttpException(error: HttpException): Promise<BlApiError> {
    // handle validation errors from ValidationPipe (message is an array of constraint descriptions)
    const response = error.getResponse();
    if (typeof response === 'object' && 'message' in response) {
      const message = (response as any).message;
      if (Array.isArray(message)) {
        const detail = `Validation failed:\n- ${message.join('\n- ')}`;
        return this.convertToNestError(detail, error.getStatus());
      }
    }

    // translate the error message and throw the exception with error code and message
    return this.convertToNestError(error.message, error.getStatus());
  }

  private async handleUnknownException(error: Error): Promise<BlApiError> {
    const instanceId: string = ClStringHelper.generateUUID();

    // log the error
    this.logUnknownError(error, instanceId);

    // in prod env, send a server error exception to hide detail for the user
    if (this.options.isProduction) {
      // translate the error message and throw the exception with error code and message
      return this.convertToNestError(this.options.serverError, HttpStatus.BAD_REQUEST);
    } else {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: this.options.serverError,
        detail: error.message,
        instanceId: instanceId,
      };
    }
  }

  // method to log the error in the console with context info

  // handle ER_DATA_TOO_LONG error when inserting in DB
  private handleDataTooLongException(error: QueryFailedError): Promise<BlApiError> {
    // split message on ' character
    // example of message: ER_DATA_TOO_LONG: Data too long for column 'title' at row 1
    const splitMessage: string[] = error.message.split("'");
    let fieldName: string = '';
    if (splitMessage?.length > 1) {
      // get the text between '
      fieldName = splitMessage[1];
    }

    return this.convertToNestError(this.options.errorColumnToLong, HttpStatus.BAD_REQUEST, {
      args: { field: fieldName },
    });
  }

  /**
   * Translate the message and return an error observable with status
   */
  private async convertToNestError(
    errorCode: string,
    status: HttpStatus,
    translateOptions: BlTranslateOptions = {},
    instanceId?: string
  ): Promise<BlApiError> {
    // translate the error message and throw the exception with error code and message
    const translatedMessage: string = await this.translateService.translateIfExists(
      errorCode,
      translateOptions
    );

    return {
      status: status,
      code: errorCode,
      detail: translatedMessage,
      instanceId: instanceId != null ? instanceId : ClStringHelper.generateUUID(),
    };
  }
}
