// Injection token for the mail config
import { ModuleMetadata } from '@nestjs/common/interfaces';

export const BL_MAIL_CONFIG_PROVIDER = Symbol();
export const BL_MAIL_CAN_GET_MAIL_PROVIDER = Symbol();

/**
 * Information to configure mail
 */
export interface BlMailConfig {
  sender: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

/**
 * configuration for the mail module
 */
export interface BlMailModuleConfig {
  mailConfig: BlMailConfig;
  templateFolder: string;
  defaultLayout?: string; // name of the mail template in the template folder without the lang
  defaultData?: Record<string, any>;
}

export interface BlMailModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<BlMailModuleConfig> | BlMailModuleConfig;
  inject?: any[];
}

export interface BlMailQueue {
  id: string;
}

/**
 * Function called on mail route to check if the current user is an admin
 */
export type BlCurrentUserIsAdmin = () => boolean;
