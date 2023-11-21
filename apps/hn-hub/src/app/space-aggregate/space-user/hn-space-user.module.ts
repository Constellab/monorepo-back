import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnSpaceUserService} from './hn-space-user.service';
import {HnSpaceUser} from './hn-space-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnSpaceUser])
  ],
  exports: [TypeOrmModule, HnSpaceUserService],
  providers: [HnSpaceUserService]
})
export class HnSpaceUserModule {

}
