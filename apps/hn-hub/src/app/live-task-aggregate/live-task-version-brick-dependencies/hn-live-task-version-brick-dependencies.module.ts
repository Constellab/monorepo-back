import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnLiveTaskVersionBrickDependencies} from './hn-live-task-version-brick-dependencies.entity';
import {HnLiveTaskVersionBrickDependenciesService} from './hn-live-task-version-brick-dependencies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnLiveTaskVersionBrickDependencies]),
  ],
  exports: [TypeOrmModule, HnLiveTaskVersionBrickDependenciesService],
  providers: [HnLiveTaskVersionBrickDependenciesService]
})
export class HnLiveTaskVersionBrickDependenciesModule {

}
