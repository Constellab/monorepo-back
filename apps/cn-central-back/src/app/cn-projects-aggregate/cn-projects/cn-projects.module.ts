import {Module} from '@nestjs/common';
import {CnProjectsService} from './cn-projects.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnCoreModule} from '../../cn-core/cn-core.module';
import {CnProject} from './cn-project.entity';
import {CnProjectStatusHistory} from './cn-project-status-history.entity';
import {CnGroupsModule} from '../../cn-groups/cn-groups.module';
import {CnUsersModule} from '../../cn-users/cn-users.module';
import {CnProjectBucketModule} from '../cn-project-bucket/cn-project-bucket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProject, CnProjectStatusHistory]),

    CnCoreModule,
    CnGroupsModule,
    CnUsersModule,
    CnProjectBucketModule
  ],
  providers: [
    CnProjectsService,
  ],
  exports: [
    CnProjectsService,
  ]
})
export class CnProjectsModule {
}
