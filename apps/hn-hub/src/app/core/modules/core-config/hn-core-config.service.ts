import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  HN_BUCKET_DOCUMENTATION_BACKUP_KEY,
  HN_BUCKET_DOCUMENTATION_KEY, HN_BUCKET_STORIES_BACKUP_KEY, HN_BUCKET_STORIES_KEY,
  HN_ENVIRONMENT_PROFILE_KEY,
  HN_ENVIRONMENT_PROFILE_PROD_VALUE,
  HN_RABBITMQ_PASSWORD_KEY,
  HN_RABBITMQ_PORT_KEY,
  HN_RABBITMQ_URL_KEY,
  HN_RABBITMQ_USER_KEY,
  HnEnvironmentProfile
} from '../../model/config/hn-config.class';
import {
  BlMailConfig,
  BlObjectStorageCredentials,
  BlTransportModuleConfig,
  blTransportQueueHub
} from '@monorepo/back-core-lib';
import {HnDatabaseConfig} from '../../model/config/hn-database-config.class';

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
    return this.isLocal() ? 'http://localhost:3001/' : this.configService.get('CENTRAL_API_URL');
  }

  // api key to communicate with central api
  public getCentralApiKey(): string {
    return this.configService.get('CENTRAL_API_KEY');
  }

  public getDatabaseConfig(): HnDatabaseConfig {
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

  public getDefaultObjectStorageEndPoint(): string {
    return this.configService.get('OBJECT_STORAGE_DEFAULT_ENDPOINT');
  }

  public getBackupObjectStorageEndPoint(): string {
    return this.configService.get('OBJECT_STORAGE_BACKUP_ENDPOINT');
  }

  public getDefaultObjectStorageRegion(): string {
    return this.configService.get('OBJECT_STORAGE_DEFAULT_REGION');
  }

  public getBackupObjectStorageRegion(): string {
    return this.configService.get('OBJECT_STORAGE_BACKUP_REGION');
  }

  public getDefaultObjectStorageCredentials(): BlObjectStorageCredentials {
    return {
      accessKeyId: this.configService.get('OBJECT_STORAGE_DEFAULT_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('OBJECT_STORAGE_DEFAULT_SECRET_KEY'),
    };
  }

  public getDocImageObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_DOCUMENTATION_KEY);
  }

  public getDocImageObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_DOCUMENTATION_BACKUP_KEY);
  }

  public getStoryImageObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_STORIES_KEY);
  }

  public getStoryImageObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_STORIES_BACKUP_KEY);
  }

  public getFrontBaseUrl(): string {
    let res: string;
    switch (this.getEnvironmentProfile()) {
      case 'prod':
        res = 'https://constellab.community';
        break;
      case 'preprod':
        res = 'https://hub-pre-prod.gencovery.com';
        break;
      case 'dev':
        res = 'http://localhost:4200';
    }
    return res;
  }

  public getConstellabFrontBaseUrl(): string {
    let res: string;
    switch (this.getEnvironmentProfile()) {
      case 'prod':
        res = 'https://constellab.space/';
        break;
      case 'preprod':
        res = 'https://preconstellab.com/';
        break;
      case 'dev':
        res = 'http://localhost:4200/';
    }
    return res;
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.configService.get('LOG_PATH');
  }

  public getMailConfig(): BlMailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      sender: this.configService.get('MAIL_SENDER')
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

  public getGencoveryContactMail(): string {
    return this.configService.get('GENCOVERY_CONTACT_MAIL');
  }

  // protected getConfigNumber(configName: string): number {
  //   try {
  //     return parseInt(this.configService.get(configName), 10);
  //   } catch (error) {
  //     console.error('Error while parsing config ' + configName + ' to number');
  //     throw error;
  //   }
  // }
}

