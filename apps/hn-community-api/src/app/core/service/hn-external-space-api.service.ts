import {
  BlExternalApiError,
  BlExternalApiHttpOption,
  BlExternalApiService,
  BlHttpException,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, Observable, throwError } from 'rxjs';

import { HnCoreConfigService } from '../modules/core-config/hn-core-config.service';

export interface HnVerifyLabResult {
  labId: string;
  userId: string;
}

export interface HnVerifyLabWithoutUserResult {
  labId: string;
}

/**
 * Service to call the Space API.
 * Centralizes all HTTP calls to the Space API with proper error handling.
 */
@Injectable()
export class HnExternalSpaceApiService {
  constructor(
    private readonly externalApiService: BlExternalApiService,
    private readonly configService: HnCoreConfigService
  ) {}

  /**
   * Verify that the provided lab API key matches the lab stored in the Space API
   * and that the given user belongs to that lab.
   * Returns the labId and userId if valid.
   */
  verifyLabApiKey(authorizationHeader: string, userHeader: string): Promise<HnVerifyLabResult> {
    return this.get('/external-community-labs/verify-lab-api-key', {
      headers: { authorization: authorizationHeader, user: userHeader },
    });
  }

  /**
   * Verify that the provided lab API key matches the lab stored in the Space API
   * without requiring a specific user (used for automated lab requests).
   * Returns only the labId if valid.
   */
  verifyLabApiKeyWithoutUser(authorizationHeader: string): Promise<HnVerifyLabWithoutUserResult> {
    return this.get('/external-community-labs/verify-lab-api-key-no-user', {
      headers: { authorization: authorizationHeader },
    });
  }

  /**
   * Check if the lab (identified by its API key) has access to a private brick,
   * based on the lab configuration stored in the Space API.
   */
  checkLabBrickAccess(authorizationHeader: string, brickName: string): Promise<{ hasAccess: boolean }> {
    return this.get(`/external-community-labs/check-lab-brick-access/${brickName}`, {
      headers: { authorization: authorizationHeader },
    });
  }

  /**
   * Check if a user exists and is valid (status READY) in the Space API.
   * Authenticated via the SPACE_API_KEY.
   */
  checkUserValid(userId: string): Promise<any> {
    return this.get(`/external-community/check-user/${userId}`, {
      headers: { 'X-Api-Key': this.configService.getSpaceApiKey() },
    });
  }

  private get(route: string, options: BlExternalApiHttpOption = {}): Promise<any> {
    return lastValueFrom(
      this.externalApiService
        .get(this.constructRoute(route), null, options)
        .pipe(catchError((error: BlExternalApiError) => this.catchError(error)))
    );
  }

  private constructRoute(route: string): string {
    return this.configService.getSpaceApiUrl() + route;
  }

  private catchError(error: BlExternalApiError): Observable<never> {
    if (error?.knownError) {
      return throwError(() => BlHttpException.fromApiError(error.knownError));
    }
    return throwError(() => new BlUnauthorizedException());
  }
}
