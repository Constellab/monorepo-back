import {Module} from '@nestjs/common';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnProjectsController} from './cn-projects.controller';
import {CnProjectAggregateService} from './cn-project-aggregate.service';
import {CnProjectsAggregateSecurity} from './cn-projects-aggregate.security';
import {CnExperimentsModule} from './cn-experiments/cn-experiments.module';
import {CnReportsModule} from './cn-reports/cn-reports.module';
import {CnExperimentsController} from './cn-experiments/cn-experiments.controller';
import {CnReportsController} from './cn-reports/cn-reports.controller';
import {CnProjectsModule} from './cn-projects/cn-projects.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnProjectCommentModule} from '../cn-project-comment/cn-project-comment.module';
import {CnDocumentsModule} from './cn-documents/cn-documents.module';
import {CnProjectBucketModule} from './cn-project-bucket/cn-project-bucket.module';
import {CnProjectListener} from './cn-project.listener';
import {CnProjectUserModule} from './cn-project-user/cn-project-user.module';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';
import {CnActivityModule} from '../cn-activity/cn-activity.module';
import {EventEmitterModule} from '@nestjs/event-emitter';
import {CnCloudProvidersModule} from '../cn-cloud-providers/cn-cloud-providers.module';

@Module({
  imports: [
    CnCoreModule,

    CnProjectsModule,
    CnProjectCommentModule,
    CnProjectBucketModule,
    CnProjectUserModule,

    CnExperimentsModule,
    CnReportsModule,
    CnDocumentsModule,

    CnUsersModule,
    CnNotificationModule,
    CnActivityModule,
    CnCloudProvidersModule,

    EventEmitterModule,
  ],
  controllers: [
    CnProjectsController,
    CnExperimentsController,
    CnReportsController,
  ],
  providers: [
    CnProjectsAggregateSecurity,
    CnProjectAggregateService,
    CnProjectListener,
  ],
  exports: [
    CnProjectsAggregateSecurity,
    CnProjectAggregateService
  ]
})
export class CnProjectsAggregateModule {
}
