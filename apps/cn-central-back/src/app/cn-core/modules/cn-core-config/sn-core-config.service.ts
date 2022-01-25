import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  CN_ENVIRONMENT_PROFILE_KEY,
  CN_ENVIRONMENT_PROFILE_PROD_VALUE,
  CnEnvironmentProfile
} from '../../model/config/cn-config.class';
import {SnDatabaseConfig} from '../../../sn-smart-db/model/sn-config.class';

@Injectable()
export class SnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): CnEnvironmentProfile {
    return this.configService.get(CN_ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === CN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public isLocal(): boolean {
    const env: CnEnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }


  public getDatabaseConfig(): SnDatabaseConfig {
    return {
      node: this.configService.get('SMART_DB_ELASTICSEARCH_NODE'),
      username: this.configService.get('SMART_DB_ELASTICSEARCH_USERNAME'),
      password: this.configService.get('SMART_DB_ELASTICSEARCH_PASSWORD'),
    };
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.configService.get('LOG_PATH');
  }

}
