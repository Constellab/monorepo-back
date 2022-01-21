import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  SN_ENVIRONMENT_PROFILE_KEY,
  SN_ENVIRONMENT_PROFILE_PROD_VALUE,
  SnDatabaseConfig,
  SnEnvironmentProfile
} from '../model/sn-config.class';

@Injectable()
export class SnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getEnvironmentProfile(): SnEnvironmentProfile {
    return this.configService.get(SN_ENVIRONMENT_PROFILE_KEY);
  }

  public isProduction(): boolean {
    return this.getEnvironmentProfile() === SN_ENVIRONMENT_PROFILE_PROD_VALUE;
  }

  public isLocal(): boolean {
    const env: SnEnvironmentProfile = this.getEnvironmentProfile();
    return env === 'dev' || env === 'docker' || env === 'test';
  }


  public getDatabaseConfig(): SnDatabaseConfig {
    return {
      node: this.configService.get('ELASTICSEARCH_NODE'),
      username: this.configService.get('ELASTICSEARCH_USERNAME'),
      password: this.configService.get('ELASTICSEARCH_PASSWORD'),
    };
  }

  public getLogLevel(): LogLevel {
    return this.configService.get('LOG_LEVEL') ?? 'log';
  }

  public getLogPath(): string {
    return this.configService.get('LOG_PATH');
  }

}
