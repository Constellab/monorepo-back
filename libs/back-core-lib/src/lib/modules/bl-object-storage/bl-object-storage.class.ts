import {ModuleMetadata} from '@nestjs/common/interfaces';

export const BL_OBJECT_STORAGE_CONFIG_PROVIDER = Symbol();

/**
 * Configuration for the BlObjectStorageModule.
 * The env variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set to work
 */
export interface BlObjectStorageModuleConfig {
  endpoint: string;
  region: string;
}

export interface BlObjectStorageModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<BlObjectStorageModuleConfig> | BlObjectStorageModuleConfig;
  inject?: any[];
}
