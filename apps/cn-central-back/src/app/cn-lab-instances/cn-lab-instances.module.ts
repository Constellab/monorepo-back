import {forwardRef, Module} from '@nestjs/common';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstancesController} from './cn-lab-instances.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnLabInstanceAggregateService} from './cn-lab-instance-aggregate.service';
import {CnExternalLabApiModule} from '../cn-external-lab-api/cn-external-lab-api.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnExperimentsModule} from '../cn-projects-aggregate/cn-experiments/cn-experiments.module';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnBricksModule} from '../cn-bricks/cn-bricks.module';
import {CnLabConfigsModule} from '../cn-lab-configs/cn-lab-configs.module';
import {CnLabInstanceMailService} from './cn-lab-instance-mail.service';
import {CnLabInstancesSecurity} from './cn-lab-instances.security';
import {CnLabInstanceGroup} from './cn-lab-instance-group.entity';
import {CnGroupsModule} from '../cn-groups/cn-groups.module';
import {CnLabInstanceGroupService} from './cn-lab-instance-group.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabInstance,
      CnLabInstanceStatusHistory,
      CnLabInstanceGroup,
    ]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnUsersModule,
    forwardRef(() => CnExperimentsModule),
    CnBricksModule,
    CnLabConfigsModule,
    CnGroupsModule,
  ],
  providers: [
    CnLabInstancesService,
    CnLabInstanceAggregateService,
    CnLabManagerService,
    CnLabInstanceMailService,
    CnLabInstancesSecurity,
    CnLabInstanceGroupService,
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
