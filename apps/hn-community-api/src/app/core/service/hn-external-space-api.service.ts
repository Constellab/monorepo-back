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
   * Verify lab rights with a user
   */
  verifyLabRights(authorizationHeader: string, userHeader: string): Promise<any> {
    return this.get('/external-community-labs/verify-rights', {
      headers: { authorization: authorizationHeader, user: userHeader },
    });
  }

  /**
   * Verify lab rights without a user
   */
  verifyLabRightsWithoutUser(authorizationHeader: string): Promise<any> {
    return this.get('/external-community-labs/verify-without-user-rights', {
      headers: { authorization: authorizationHeader },
    });
  }

  /**
   * Check if a lab has access to a brick by name
   */
  checkBrickAccessByName(authorizationHeader: string, brickName: string): Promise<{ hasAccess: boolean }> {
    return this.get(`/external-community-labs/check-brick-access/${brickName}`, {
      headers: { authorization: authorizationHeader },
    });
  }

  /**
   * Check if a lab has access to a brick by name and version
   */
  checkBrickAccess(
    authorizationHeader: string,
    brickName: string,
    version: string
  ): Promise<{ hasAccess: boolean }> {
    return this.get(`/external-community-labs/check-brick-access/${brickName}/${version}`, {
      headers: { authorization: authorizationHeader },
    });
  }

  /**
   * Check if a user is valid in the Space API
   */
  checkUserValid(userId: string): Promise<any> {
    return this.get(`/users/valid/${userId}`);
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
