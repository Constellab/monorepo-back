import { ClDeserializationRef } from '@monorepo/core-lib';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BlExternalApiErrorService {
  private logger = new Logger(BlExternalApiErrorService.name);
  /**
   * Handle an error during deserialization of the API response
   * @param error deserialization error
   * @param classReference class tried to be converted
   */
  public handleDeserializationError(error: any, classReference: ClDeserializationRef): never {
    // get the predefine error message
    const errorMessage = `Error while deserializing object of type ${classReference.name}}`;

    // console logs
    this.logger.error(errorMessage);
    this.logger.error(error);

    // throw the exception
    // noinspection UnnecessaryLocalVariableJS
    const returnError: any = {
      response: null,
      logDetail: {
        message: errorMessage,
        timestamp: new Date(),
      },
    };
    throw returnError;
  }
}
