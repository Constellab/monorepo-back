import {ModuleMetadata} from '@nestjs/common/interfaces';

export const BL_CAPTCHA_CONFIG_PROVIDER = Symbol();


export class BlCaptchaModuleConfig {
  secretKey: string;
  localEnv: boolean; // if true captcha validation will be skipped
}

export interface BlCaptchaModuleConfigAsyncConfig extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => BlCaptchaModuleConfig;
  inject?: any[];
}
