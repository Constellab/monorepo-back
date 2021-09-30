import {Injectable, LogLevel} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {EnvironmentProfile} from '../../model/config/config.class';
import {DatabaseConfig} from '../../model/config/database-config.class';

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
  public getDatabaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: this.configService.get('DATABASE')
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
}

