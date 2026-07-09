import { BlMailConfig, BlObjectStorageCredentials, BlTransportModuleConfig } from '@monorepo/back-core-lib';
import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  HN_BUCKET_AGENTS_BACKUP_KEY,
  HN_BUCKET_AGENTS_KEY,
  HN_BUCKET_APPS_BACKUP_KEY,
  HN_BUCKET_APPS_KEY,
  HN_BUCKET_DOCUMENTATION_BACKUP_KEY,
  HN_BUCKET_DOCUMENTATION_KEY,
  HN_BUCKET_ICON_BACKUP_KEY,
  HN_BUCKET_ICON_KEY,
  HN_BUCKET_PARTNERS_BACKUP_KEY,
  HN_BUCKET_PARTNERS_KEY,
  HN_BUCKET_STORIES_BACKUP_KEY,
  HN_BUCKET_STORIES_KEY,
  HN_ENVIRONMENT_PROFILE_KEY,
  HN_ENVIRONMENT_PROFILE_PROD_VALUE,
  HN_RAGFLOW_API_KEY,
  HN_RAGFLOW_BASE_URL,
  HN_RAGFLOW_CHAT_ID,
  HnEnvironmentProfile,
} from '../../model/config/hn-config.class';
import { HnDatabaseConfig } from '../../model/config/hn-database-config.class';

@Injectable()
export class HnCoreConfigService {
  private logger = new Logger(HnCoreConfigService.name);
  constructor(protected configService: ConfigService) {}

  public getEnvironmentProfile(): HnEnvironmentProfile {
    const profile: HnEnvironmentProfile | undefined = this.configService.get(HN_ENVIRONMENT_PROFILE_KEY);
    if (profile == null) {
      throw Error(`Missing config value for '${HN_ENVIRONMENT_PROFILE_KEY}'`);
    }
    return profile;
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === HN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public getApiUrl(): string {
    return this.getConfigString('API_URL');
  }

  public getJwtSecret(): string {
    return this.getConfigString('JWT_SECRET');
  }

  public isLocal(): boolean {
    const env: HnEnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }

  public isDev(): boolean {
    return this.getEnvironmentProfile() === 'dev';
  }

  public getSpaceApiUrl(): string {
    return this.isLocal() ? 'http://localhost:3001' : this.getConfigString('SPACE_API_URL');
  }

  // api key to communicate with space api
  public getSpaceApiKey(): string {
    return this.getConfigString('SPACE_API_KEY');
  }

  public getDatabaseConfig(): HnDatabaseConfig {
    return {
      host: this.getConfigString('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.getConfigString('DATABASE_USER'),
      password: this.getConfigString('DATABASE_PASSWORD'),
      database: this.getConfigString('DATABASE'),
    };
  }

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      password: this.getConfigString('QUEUE_SERVICE_PASSWORD'),
      host: this.getConfigString('QUEUE_SERVICE_HOST'),
      port: this.getConfigNumber('QUEUE_SERVICE_PORT'),
    };
  }

  public getDefaultObjectStorageEndPoint(): string {
    return this.getConfigString('OBJECT_STORAGE_DEFAULT_ENDPOINT');
  }

  public getBackupObjectStorageEndPoint(): string {
    return this.getConfigString('OBJECT_STORAGE_BACKUP_ENDPOINT');
  }

  public getDefaultObjectStorageRegion(): string {
    return this.getConfigString('OBJECT_STORAGE_DEFAULT_REGION');
  }

  public getBackupObjectStorageRegion(): string {
    return this.getConfigString('OBJECT_STORAGE_BACKUP_REGION');
  }

  public getDefaultObjectStorageCredentials(): BlObjectStorageCredentials {
    return {
      accessKeyId: this.getConfigString('OBJECT_STORAGE_DEFAULT_ACCESS_KEY_ID'),
      secretAccessKey: this.getConfigString('OBJECT_STORAGE_DEFAULT_SECRET_KEY'),
    };
  }

  public getIconObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_ICON_KEY);
  }

  public getIconObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_ICON_BACKUP_KEY);
  }

  public getDocImageObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_DOCUMENTATION_KEY);
  }

  public getDocImageObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_DOCUMENTATION_BACKUP_KEY);
  }

  public getStoryFilesObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_STORIES_KEY);
  }

  public getStoryFilesObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_STORIES_BACKUP_KEY);
  }

  public getAgentFilesObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_AGENTS_KEY);
  }

  public getAgentFilesObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_AGENTS_BACKUP_KEY);
  }

  public getAppFilesObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_APPS_KEY);
  }

  public getAppFilesObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_APPS_BACKUP_KEY);
  }

  public getPartnerFilesObjectStorageBucket(): string {
    return this.getConfigString(HN_BUCKET_PARTNERS_KEY);
  }

  public getPartnerFilesObjectStorageBackupBucket(): string {
    return this.getConfigString(HN_BUCKET_PARTNERS_BACKUP_KEY);
  }

  public getGencoverySpaceId(): string {
    return this.getConfigString('GENCOVERY_SPACE_ID');
  }

  public getFrontBaseUrl(): string {
    let res: string;
    switch (this.getEnvironmentProfile()) {
      case 'prod':
        res = 'https://constellab.community';
        break;
      case 'preprod':
        res = 'https://community-pre-prod.gencovery.com';
        break;
      case 'dev':
        res = 'http://localhost:4200';
        break;
      default:
        throw Error(`No front base url configured for environment '${this.getEnvironmentProfile()}'`);
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
        break;
      default:
        throw Error(`No constellab front base url configured for environment '${this.getEnvironmentProfile()}'`);
    }
    return res;
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.getConfigString('LOG_PATH');
  }

  public getMailConfig(): BlMailConfig {
    return {
      host: this.getConfigString('MAIL_HOST'),
      port: this.getConfigNumber('MAIL_PORT'),
      secure: this.getConfigBoolean('MAIL_SECURE'),
      user: this.getConfigString('MAIL_USER'),
      password: this.getConfigString('MAIL_PASSWORD'),
      sender: this.getConfigString('MAIL_SENDER'),
    };
  }

  protected getConfigString(configName: string): string {
    const value: string | undefined = this.configService.get(configName);
    if (value == null) {
      throw Error(`Missing config value for '${configName}'`);
    }
    return value;
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.getConfigString(configName), 10);
    } catch (error) {
      this.logger.error('Error while parsing config ' + configName + ' to number');
      throw error;
    }
  }

  protected getConfigBoolean(configName: string): boolean {
    const stringBool: string = this.getConfigString(configName);

    if (stringBool === 'false') {
      return false;
    } else if (stringBool === 'true') {
      return true;
    } else {
      throw Error(`Error while parsing config ${configName} value '${stringBool}' to boolean`);
    }
  }

  public getRobotUserMail(): string {
    return this.getConfigString('ROBOT_USER_MAIL');
  }

  public getCustomerSuccessMail(): string {
    return this.getConfigString('CUSTOMER_SUCCESS_MAIL');
  }

  // protected getConfigNumber(configName: string): number {
  //   try {
  //     return parseInt(this.configService.get(configName), 10);
  //   } catch (error) {
  //     this.logger.error('Error while parsing config ' + configName + ' to number');
  //     throw error;
  //   }
  // }

  public getDbBackupBucket(): string {
    return this.isProduction() ? 'constellab-db-backup-prod' : 'constellab-db-backup-pre-prod';
  }

  public getDbBackupEndpoint(): string {
    return this.getConfigString('OBJECT_STORAGE_DB_BACKUP_ENDPOINT');
  }

  public getDbBackupRegion(): string {
    return this.getConfigString('OBJECT_STORAGE_DB_BACKUP_REGION');
  }

  public getDomain(): string {
    return this.getConfigString('DOMAIN');
  }

  public getRagflowApiKey(): string {
    return this.getConfigString(HN_RAGFLOW_API_KEY);
  }

  public getRagflowBaseUrl(): string {
    return this.getConfigString(HN_RAGFLOW_BASE_URL);
  }

  public getRagflowChatId(): string | undefined {
    return this.configService.get(HN_RAGFLOW_CHAT_ID);
  }
}
