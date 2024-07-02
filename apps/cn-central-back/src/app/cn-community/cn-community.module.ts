import {Module} from '@nestjs/common';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnCommunityController} from './cn-community.controller';
import {CnCommunityService} from './cn-community.service';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [CnCoreModule, HttpModule],
  controllers: [CnCommunityController],
  providers: [CnCommunityService],
})
export class CnCommunityModule {
}
