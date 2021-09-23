// Injection token for the mail config
import {ModuleMetadata} from '@nestjs/common/interfaces';

export const BL_MAIL_CONFIG_PROVIDER = Symbol();

/**
 * configuration for the mail module
 */
export interface BlMailModuleConfig {
  sender: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface BlMailModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<BlMailModuleConfig> | BlMailModuleConfig;
  inject?: any[];
}
