import {Module} from '@nestjs/common';
import {CoreConfigService} from './core-config.service';
import {ConfigModule} from '@nestjs/config';
import { CoreConfigController } from './core-config.controller';

@Module({
  imports: [ConfigModule],
  providers: [CoreConfigService],
  exports: [CoreConfigService],
  controllers: [CoreConfigController]
})
export class CoreConfigModule {
}
