import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SnDatabaseConfig} from '../model/sn-config.class';

@Injectable()
export class SnCoreConfigService {

  constructor(protected configService: ConfigService) {
  }

  public getDatabaseConfig(): SnDatabaseConfig {
    return {
      node: this.configService.get('ELASTICSEARCH_NODE'),
      username: this.configService.get('ELASTICSEARCH_USERNAME'),
      password: this.configService.get('ELASTICSEARCH_PASSWORD'),
    };
  }

}
