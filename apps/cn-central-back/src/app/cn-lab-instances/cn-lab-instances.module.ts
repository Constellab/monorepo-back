import {Module} from '@nestjs/common';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstancesController} from './cn-lab-instances.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnLabInstanceStatusHistory} from './status/cn-lab-instance-status-history.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnExternalLabApiModule} from '../cn-external-lab-api/cn-external-lab-api.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnExperimentsModule} from '../cn-projects-aggregate/cn-experiments/cn-experiments.module';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnBricksModule} from '../cn-bricks/cn-bricks.module';
import {CnLabConfigsModule} from '../cn-lab-configs/cn-lab-configs.module';
import {CnLabInstanceMailService} from './mail/cn-lab-instance-mail.service';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {CnLabInstanceUser} from './user/cn-lab-instance-user.entity';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {CnLabInstanceUserService} from './user/cn-lab-instance-user.service';
import {CnLabInstanceProject} from './project/cn-lab-instance-project.entity';
import {CnLabInstanceProjectService} from './project/cn-lab-instance-project.service';
import {CnProjectsAggregateModule} from '../cn-projects-aggregate/cn-project-aggregate.module';
import {CnReportsModule} from '../cn-projects-aggregate/cn-reports/cn-reports.module';
import {CnObjectStoragesModule} from '../cn-object-storages/cn-object-storages.module';
import {CnOvhService} from './cloud-provider/ovh/cn-ovh.service';
import {CnLabCloudProviderService} from './cloud-provider/cn-lab-cloud-provider.service';
import {CnCloudProviderOvhService} from './cloud-provider/ovh/cn-cloud-provider-ovh.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabInstance,
      CnLabInstanceStatusHistory,
      CnLabInstanceUser,
      CnLabInstanceProject
    ]),

    CnCoreModule,
    CnExternalLabApiModule,

    CnUsersModule,
    CnBricksModule,
    CnLabConfigsModule,
    CnGroupsModule,

    CnProjectsAggregateModule,
    CnExperimentsModule,
    CnReportsModule,
    CnObjectStoragesModule,
  ],
  providers: [
    CnLabInstancesService,
    CnLabInstanceAggregateService,
    CnLabManagerService,
    CnLabInstanceMailService,
    CnLabInstancesSecurity,
    CnLabInstanceUserService,
    CnLabInstanceProjectService,
    CnLabCloudProviderService,
    CnOvhService,
    CnCloudProviderOvhService
  ],
  exports: [
    CnLabInstancesService,
    CnLabInstanceAggregateService,
    CnLabInstanceMailService,
  ],
  controllers: [CnLabInstancesController],
})
export class CnLabInstancesModule {
}
