import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {SnCoreConfigService} from './sn-core-config.service';

@Module({
  imports: [ConfigModule],
  providers: [SnCoreConfigService],
  exports: [SnCoreConfigService],
  controllers: []
})
export class SnCoreModule {
}
