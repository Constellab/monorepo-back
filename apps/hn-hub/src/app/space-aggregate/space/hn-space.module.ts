import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnSpace} from './hn-space.entity';
import {HnSpaceService} from './hn-space.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnSpace])
  ],
  exports: [TypeOrmModule, HnSpaceService],
  providers: [HnSpaceService]
})
export class HnSpaceModule {

}
