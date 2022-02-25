import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  HN_ENVIRONMENT_PROFILE_KEY,
  HN_ENVIRONMENT_PROFILE_PROD_VALUE,
  HN_RABBITMQ_PASSWORD_KEY,
  HN_RABBITMQ_PORT_KEY,
  HN_RABBITMQ_URL_KEY,
  HN_RABBITMQ_USER_KEY,
  HnEnvironmentProfile
} from '../../model/config/hn-config.class';
import {DnDatabaseConfig} from '../../model/config/hn-database-config.class';
import {BlTransportModuleConfig, blTransportQueueHub} from '@monorepo/back-core-lib';

@Injectable()
export class HnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): HnEnvironmentProfile {
    return this.configService.get(HN_ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === HN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  public isLocal(): boolean {
    const env: HnEnvironmentProfile = this.getEnvironmentProfile();
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

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      queue: blTransportQueueHub,
      username: this.configService.get(HN_RABBITMQ_USER_KEY),
      password: this.configService.get(HN_RABBITMQ_PASSWORD_KEY),
      url: this.configService.get(HN_RABBITMQ_URL_KEY),
      port: this.configService.get(HN_RABBITMQ_PORT_KEY),
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

