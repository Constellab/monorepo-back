import {Injectable} from '@nestjs/common';
import {CoreConfigService} from '../src/app/core/modules/core-config/core-config.service';
import {EnvironmentProfile} from '../src/app/core/model/config/config.class';
import {DatabaseConfig} from '../src/app/core/model/config/database-config.class';

/**
 * Override CoreConfigService for test to set Test env and correct DB
 */
@Injectable()
export class TestConfigService extends CoreConfigService {


  getEnvironmentProfile(): EnvironmentProfile {
    return 'test';
  }


  public getDatabaseConfig(): DatabaseConfig {
    return {
      host: this.configService.get('DATABASE_HOST'),
      port: this.getConfigNumber('DATABASE_PORT'),
      username: this.configService.get('DATABASE_USER'),
      password: this.configService.get('DATABASE_PASSWORD'),
      database: 'gencoveryDbTest'
    };
  }
}
