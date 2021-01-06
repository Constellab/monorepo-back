import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CoreModule} from '../core/core.module';
import {ServerInfo} from './server-info.entity';
import { ServersInfoService } from './servers-info.service';
import { ServersInfoController } from './servers-info.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerInfo]),

    CoreModule,
  ],
  providers: [ServersInfoService],
  controllers: [ServersInfoController]
})
export class ServersInfoModule {
}
