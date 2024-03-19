import {Module} from '@nestjs/common';
import {HnSpaceUserModule} from './space-user/hn-space-user.module';
import {HnSpaceAggregateService} from './hn-space-aggregate.service';
import {HnSpaceController} from './hn-space.controller';
import {HnSpaceModule} from './space/hn-space.module';
import {HnUserService} from '../users/hn-user.service';
import {HnUserModule} from '../users/hn-user.module';
import {HnCoreModule} from '../core/hn-core.module';

@Module({
  imports: [
    HnUserModule,
    HnCoreModule,
    HnSpaceModule,
    HnSpaceUserModule,
  ],
  controllers: [HnSpaceController],
  providers: [HnSpaceAggregateService, HnUserService],
  exports: [HnSpaceAggregateService]
})
export class HnSpaceAggregateModule {

}
