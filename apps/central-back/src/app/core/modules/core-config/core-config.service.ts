import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EnvironmentProfile} from '../../model/config/config.class';
import {DatabaseConfig} from '../../model/config/database-config.class';
import {BlMailModuleConfig} from '@monorepo/back-core-lib';

@Injectable()
export class CoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): EnvironmentProfile {
    return this.configService.get('ENVIRONMENT_PROFILE');
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === 'prod';
  }

  public isLocal(): boolean {
    const env: EnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }

  public getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  // return the OTHER JWT key used to encrypt other token (such as password forgotten or mail validation)
  public getOtherJwtSecret(): string {
    return this.configService.get('OTHER_JWT_SECRET');
  }

  public getApiUrl(): string {
    return this.configService.get('API_URL');
  }

  public getRobotUserMail(): string {
    return this.configService.get('ROBOT_USER_MAIL');
  }

  public getDatabaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE')
    };
  }

  public getMailConfig(): BlMailModuleConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      sender: this.configService.get('MAIL_SENDER')
    };
  }

  public getFailedLoginLock(): number {
    return this.getConfigNumber('FAILED_LOGIN_LOCK');
  }

  public getWebsiteURL(): string {
    return this.configService.get('WEBSITE_URL');
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.configService.get(configName), 10);
    } catch (error) {
      console.error('Error while parsing config ' + configName + ' to number');
      throw error;
    }
  }

  protected getConfigBoolean(configName: string): boolean {
    const stringBool: string = this.configService.get(configName);

    if (stringBool === 'false') {
      return false;
    } else if (stringBool === 'true') {
      return true;
    } else {
      throw Error('Error while parsing config ' + configName + ' to boolean');
    }
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL');
  }

  public getLogPath(): string {
    return this.configService.get('LOG_PATH');
  }
}

