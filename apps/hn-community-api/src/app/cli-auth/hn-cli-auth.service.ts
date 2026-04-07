import { BlHttpException, BlJwtService, BlNotFoundException } from '@monorepo/back-core-lib';
import { HttpStatus, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnUser } from '../users/hn-user.entity';
import { HnCliAuthCode } from './hn-cli-auth.class';
import { HnCliAuthCodeStatus } from './hn-cli-auth.enum';

const PENDING_EXPIRATION = 2 * 60 * 1000;
const VALIDATED_EXPIRATION = 5 * 60 * 1000;
const MAX_CODE_TTL = 10 * 60 * 1000;

@Injectable()
export class HnCliAuthService {
  private readonly codeStore = new Map<string, HnCliAuthCode>();

  constructor(
    private readonly jwtService: BlJwtService,
    private readonly configService: HnCoreConfigService
  ) {}

  createCode(): { code: string; authUrl: string } {
    this.cleanupExpiredCodes();

    const code = randomBytes(32).toString('hex');
    const authCode = new HnCliAuthCode();
    authCode.code = code;
    authCode.status = HnCliAuthCodeStatus.PENDING;
    authCode.createdAt = Date.now();

    this.codeStore.set(code, authCode);

    const authUrl = this.configService.getFrontBaseUrl() + '/cli-auth?code=' + code;
    return { code, authUrl };
  }

  validateCode(code: string, user: HnUser): void {
    const authCode = this.codeStore.get(code);
    if (!authCode) {
      throw new BlNotFoundException('cli_auth_invalid_code');
    }

    if (authCode.status === HnCliAuthCodeStatus.EXPIRED) {
      throw new BlHttpException(HttpStatus.GONE, 'cli_auth_code_expired');
    }

    if (authCode.status !== HnCliAuthCodeStatus.PENDING) {
      throw new BlHttpException(HttpStatus.CONFLICT, 'cli_auth_code_already_used');
    }

    if (this.isPendingExpired(authCode)) {
      authCode.status = HnCliAuthCodeStatus.EXPIRED;
      this.codeStore.delete(code);
      throw new BlHttpException(HttpStatus.GONE, 'cli_auth_code_expired');
    }

    authCode.status = HnCliAuthCodeStatus.VALIDATED;
    authCode.validatedAt = Date.now();
    authCode.user = user;
  }

  refuseCode(code: string): void {
    const authCode = this.codeStore.get(code);
    if (!authCode) {
      throw new BlNotFoundException('cli_auth_invalid_code');
    }

    if (authCode.status === HnCliAuthCodeStatus.EXPIRED) {
      throw new BlHttpException(HttpStatus.GONE, 'cli_auth_code_expired');
    }

    if (authCode.status !== HnCliAuthCodeStatus.PENDING) {
      throw new BlHttpException(HttpStatus.CONFLICT, 'cli_auth_code_already_used');
    }

    authCode.status = HnCliAuthCodeStatus.REFUSED;
  }

  exchangeToken(code: string): { status: string; token?: string } {
    const authCode = this.codeStore.get(code);
    if (!authCode) {
      throw new BlNotFoundException('cli_auth_invalid_code');
    }

    if (authCode.status === HnCliAuthCodeStatus.PENDING) {
      if (this.isPendingExpired(authCode)) {
        authCode.status = HnCliAuthCodeStatus.EXPIRED;
        this.codeStore.delete(code);
        return { status: 'expired' };
      }
      return { status: 'authorization_pending' };
    }

    if (authCode.status === HnCliAuthCodeStatus.REFUSED) {
      this.codeStore.delete(code);
      return { status: 'access_denied' };
    }

    if (authCode.status === HnCliAuthCodeStatus.EXPIRED) {
      this.codeStore.delete(code);
      return { status: 'expired' };
    }

    // VALIDATED
    if (this.isValidatedExpired(authCode)) {
      this.codeStore.delete(code);
      return { status: 'expired' };
    }

    const token = this.jwtService.generateToken(authCode.user.id, authCode.user.email);
    this.codeStore.delete(code);
    return { status: 'success', token };
  }

  private isPendingExpired(authCode: HnCliAuthCode): boolean {
    return Date.now() - authCode.createdAt > PENDING_EXPIRATION;
  }

  private isValidatedExpired(authCode: HnCliAuthCode): boolean {
    return Date.now() - authCode.validatedAt > VALIDATED_EXPIRATION;
  }

  private cleanupExpiredCodes(): void {
    const now = Date.now();
    for (const [code, authCode] of this.codeStore) {
      if (now - authCode.createdAt > MAX_CODE_TTL) {
        this.codeStore.delete(code);
      } else if (
        authCode.status === HnCliAuthCodeStatus.PENDING &&
        now - authCode.createdAt > PENDING_EXPIRATION
      ) {
        this.codeStore.delete(code);
      } else if (
        authCode.status === HnCliAuthCodeStatus.VALIDATED &&
        now - authCode.validatedAt > VALIDATED_EXPIRATION
      ) {
        this.codeStore.delete(code);
      } else if (
        authCode.status === HnCliAuthCodeStatus.REFUSED ||
        authCode.status === HnCliAuthCodeStatus.EXPIRED
      ) {
        this.codeStore.delete(code);
      }
    }
  }
}
