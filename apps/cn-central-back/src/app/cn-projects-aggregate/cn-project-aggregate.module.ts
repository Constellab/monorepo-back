import {Module} from '@nestjs/common';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {CnProjectsController} from './cn-projects.controller';
import {CnProjectAggregateService} from './cn-project-aggregate.service';
import {CnProjectsAggregateSecurity} from './cn-projects-aggregate.security';
import {CnExperimentsModule} from './cn-experiments/cn-experiments.module';
import {CnReportsModule} from './cn-reports/cn-reports.module';
import {CnExperimentsController} from './cn-experiments.controller';
import {CnReportsController} from './cn-reports.controller';
import {CnProjectsModule} from './cn-projects/cn-projects.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnProjectCommentModule} from '../cn-project-comment/cn-project-comment.module';

@Module({
  imports: [
    CnCoreModule,
    CnGroupsModule,

    CnProjectsModule,
    CnExperimentsModule,
    CnReportsModule,
    CnUsersModule,
    CnProjectCommentModule
  ],
  controllers: [
    CnProjectsController,
    CnExperimentsController,
    CnReportsController,
  ],
  providers: [
    CnProjectsAggregateSecurity,
    CnProjectAggregateService
  ],
  exports: [
    CnProjectsAggregateSecurity,
    CnProjectAggregateService
  ]
})
export class CnProjectsAggregateModule {
}
