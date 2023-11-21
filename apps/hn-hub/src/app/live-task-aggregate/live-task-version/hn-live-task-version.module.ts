import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTaskVersion} from './hn-live-task-version.entity';
import {HnLiveTaskVersionService} from './hn-live-task-version.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLiveTaskVersion])
  ],
  exports: [TypeOrmModule, HnLiveTaskVersionService],
  providers: [HnLiveTaskVersionService]
})
export class HnLiveTaskVersionModule {

}
