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
  HN_DIFY_API_KEY,
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
    return this.configService.get(HN_ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === HN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public getApiUrl(): string {
    return this.configService.get('API_URL');
  }

  public getJwtSecret(): string {
    return this.configService.get('JWT_SECRET');
  }

  public isLocal(): boolean {
    const env: HnEnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }

  public isDev(): boolean {
    return this.getEnvironmentProfile() === 'dev';
  }

  public getSpaceApiUrl(): string {
    return this.isLocal() ? 'http://localhost:3001' : this.configService.get('SPACE_API_URL');
  }

  // api key to communicate with space api
  public getSpaceApiKey(): string {
    return this.configService.get('SPACE_API_KEY');
  }

  public getDatabaseConfig(): HnDatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.configService.get('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE'),
    };
  }

  public getTransportModuleConfig(): BlTransportModuleConfig {
    return {
      password: this.configService.get('QUEUE_SERVICE_PASSWORD'),
      host: this.configService.get('QUEUE_SERVICE_HOST'),
      port: this.configService.get('QUEUE_SERVICE_PORT'),
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

  public getIconObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_ICON_KEY);
  }

  public getIconObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_ICON_BACKUP_KEY);
  }

  public getDocImageObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_DOCUMENTATION_KEY);
  }

  public getDocImageObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_DOCUMENTATION_BACKUP_KEY);
  }

  public getStoryFilesObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_STORIES_KEY);
  }

  public getStoryFilesObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_STORIES_BACKUP_KEY);
  }

  public getAgentFilesObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_AGENTS_KEY);
  }

  public getAgentFilesObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_AGENTS_BACKUP_KEY);
  }

  public getAppFilesObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_APPS_KEY);
  }

  public getAppFilesObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_APPS_BACKUP_KEY);
  }

  public getPartnerFilesObjectStorageBucket(): string {
    return this.configService.get(HN_BUCKET_PARTNERS_KEY);
  }

  public getPartnerFilesObjectStorageBackupBucket(): string {
    return this.configService.get(HN_BUCKET_PARTNERS_BACKUP_KEY);
  }

  public getGencoverySpaceId(): string {
    return this.configService.get('GENCOVERY_SPACE_ID');
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
      sender: this.configService.get('MAIL_SENDER'),
    };
  }

  protected getConfigNumber(configName: string): number {
    try {
      return parseInt(this.configService.get(configName), 10);
    } catch (error) {
      this.logger.error('Error while parsing config ' + configName + ' to number');
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
      throw Error(`Error while parsing config ${configName} value '${stringBool}' to boolean`);
    }
  }

  public getCustomerSuccessMail(): string {
    return this.configService.get('CUSTOMER_SUCCESS_MAIL');
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
    return this.configService.get('OBJECT_STORAGE_DB_BACKUP_ENDPOINT');
  }

  public getDbBackupRegion(): string {
    return this.configService.get('OBJECT_STORAGE_DB_BACKUP_REGION');
  }

  public getDomain(): string {
    return this.configService.get('DOMAIN');
  }

  public getDifyApiKey(): string {
    return this.configService.get(HN_DIFY_API_KEY);
  }

  public getRagflowApiKey(): string {
    return this.configService.get(HN_RAGFLOW_API_KEY);
  }

  public getRagflowBaseUrl(): string {
    return this.configService.get(HN_RAGFLOW_BASE_URL);
  }

  public getRagflowChatId(): string | undefined {
    return this.configService.get(HN_RAGFLOW_CHAT_ID);
  }
}
