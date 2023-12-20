import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnSpace} from './hn-space.entity';
import {HnSpaceService} from './hn-space.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnSpace])
  ],
  providers: [HnSpaceService],
  exports: [TypeOrmModule, HnSpaceService]
})
export class HnSpaceModule {

}
