import { Injectable } from '@nestjs/common';
import { ClDeserializationRef } from '@monorepo/core-lib';

@Injectable()
export class BlExternalApiErrorService {
  /**
   * Handle an error during deserialization of the API response
   * @param error deserialization error
   * @param classReference class tried to be converted
   */
  public handleDeserializationError(error: any, classReference: ClDeserializationRef): never {
    // get the predefine error message
    const errorMessage = `Error while deserializing object of type ${classReference.name}}`;

    // console logs
    console.error(errorMessage);
    console.error(error);

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
