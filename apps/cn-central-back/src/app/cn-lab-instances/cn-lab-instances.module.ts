import {forwardRef, Module} from '@nestjs/common';
import {CnLabInstancesService} from './cn-lab-instances.service';
import {CnLabInstancesController} from './cn-lab-instances.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {CnCoreModule} from '../cn-core/cn-core.module';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnLabInstancesSecurityLayer} from './cn-lab-instances-security.layer';
import {CnExternalLabApiModule} from '../cn-external-lab-api/cn-external-lab-api.module';
import {CnUsersModule} from '../cn-users/cn-users.module';
import {CnExperimentsModule} from '../cn-projects-aggregate/cn-experiments/cn-experiments.module';
import {CnLabManagerService} from './cn-lab-manager.service';
import {CnBricksModule} from '../cn-bricks/cn-bricks.module';
import {CnLabConfigsModule} from '../cn-lab-configs/cn-lab-configs.module';
import {CnLabInstanceMailService} from './cn-lab-instance-mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnLabInstance, CnLabInstanceStatusHistory]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnUsersModule,
    forwardRef(() => CnExperimentsModule),
    CnBricksModule,
    CnLabConfigsModule,
  ],
  providers: [
    CnLabInstancesService,
    CnLabInstancesSecurityLayer,
    CnLabManagerService,
    CnLabInstanceMailService,
  ],
  exports: [
    CnLabInstancesService,
    CnLabInstancesSecurityLayer,
    CnLabInstanceMailService,
  ],
  controllers: [CnLabInstancesController],
})
export class CnLabInstancesModule {
}
