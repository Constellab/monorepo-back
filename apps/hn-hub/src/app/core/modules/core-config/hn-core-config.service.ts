import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EnvironmentProfile} from '../../model/config/hn-config.class';
import {DnDatabaseConfig} from '../../model/config/hn-database-config.class';

export const ENVIRONMENT_PROFILE_KEY = 'ENVIRONMENT_PROFILE';
export const ENVIRONMENT_PROFILE_PROD_VALUE = 'prod';

@Injectable()
export class HnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): EnvironmentProfile {
    return this.configService.get(ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  public isLocal(): boolean {
    const env: EnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }

  public getCentralApiUrl(): string {
    return this.configService.get('CENTRAL_API_URL');
  }

  public getDatabaseConfig(): DnDatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE')
    };
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.configService.get(configName), 10);
    } catch (error) {
      console.error('Error while parsing config ' + configName + ' to number');
      throw error;
    }
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.configService.get('LOG_PATH');
  }
}

