import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnServerInfo} from './cn-server-info.entity';
import {CnServersInfoService} from './cn-servers-info.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnServerInfo]),

    CnCoreModule,
  ],
  providers: [CnServersInfoService],
  exports: [CnServersInfoService],
})
export class CnServersInfoModule {
}
