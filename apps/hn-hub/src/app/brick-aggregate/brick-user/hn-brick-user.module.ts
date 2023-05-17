import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnBrickUser} from './hn-brick-user.entity';
import {HnBrickUserService} from './hn-brick-user.service';
import {HnUserModule} from '../../users/hn-user.module';

@Module({
  imports: [TypeOrmModule.forFeature([HnBrickUser]), HnUserModule],
  exports: [TypeOrmModule, HnBrickUserService],
  providers: [HnBrickUserService]
})
export class HnBrickUserModule {
}
