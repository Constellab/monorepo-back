import { Module } from '@nestjs/common';
import { CnLabInstancesService } from './cn-lab-instances.service';
import { CnLabInstancesController } from './cn-lab-instances.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnLabInstance } from './cn-lab-instance.entity';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnLabInstanceStatusHistory } from './status/cn-lab-instance-status-history.entity';
import { CnLabInstanceAggregateService } from './cn-lab-instance-aggregate.service';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnExperimentsModule } from '../cn-projects-aggregate/cn-experiments/cn-experiments.module';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnBricksModule } from '../cn-bricks/cn-bricks.module';
import { CnLabConfigsModule } from '../cn-lab-configs/cn-lab-configs.module';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnLabInstancesSecurity } from './cn-lab-instances.security';
import { CnLabInstanceUser } from './user/cn-lab-instance-user.entity';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabInstanceUserService } from './user/cn-lab-instance-user.service';
import { CnReportsModule } from '../cn-projects-aggregate/cn-reports/cn-reports.module';
import { CnObjectStoragesModule } from '../cn-object-storages/cn-object-storages.module';
import { CnOvhService } from './server/ovh/cn-ovh.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnCloudProviderOvhService } from './server/ovh/cn-cloud-provider-ovh.service';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnLabInstanceDesktopService } from './desktop/cn-lab-instance-desktop.service';
import { HttpModule } from '@nestjs/axios';
import { CnLabInstancesCron } from './cn-lab-instances.cron';
import { CnAzureService } from './server/azure/cn-azure.service';
import { CnCloudProviderAzureService } from './server/azure/cn-cloud-provider-azure.service';
import { CnCloudProviderFactory } from './server/cn-cloud-provider.factory';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnAuthModule } from '../cn-auth/cn-auth.module';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnCloudProvidersModule } from '../cn-cloud-providers/cn-cloud-providers.module';
import { CnServerCloudModule } from '../cn-servers-info/server-cloud/cn-server-cloud.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnLabInstanceStatusService } from './status/cn-lab-instance-status.service';
import { CnLabListener } from './cn-lab.listener';
import { CnLabFreeAggregateService } from './lab-free/cn-lab-free-aggregate.service';
import { CnLabFree } from './lab-free/cn-lab-free.entity';
import { CnLabBackupOption } from './backup/cn-lab-backup-option.entity';
import { CnLabBackupHistory } from './backup/cn-lab-backup-history.entity';
import { CnLabBackupOptionService } from './backup/cn-lab-backup-option.service';
import { CnLabBackupHistoryService } from './backup/cn-lab-backup-history.service';
import { CnCloudProviderOutscaleService } from './server/outscale/cn-cloud-provider-outscale.service';
import { CnServerPriceModule } from '../cn-servers-info/server-price/cn-server-price.module';
import { CnLabFactoryService } from './cn-lab-factory.service';
import { CnLabBackupAggregateService } from './backup/cn-lab-backup-aggregate.service';
import { CnSupportModule } from '../cn-support/cn-support.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabInstance,
      CnLabInstanceStatusHistory,
      CnLabInstanceUser,
      CnLabGreenOption,
      CnLabFree,
      CnLabBackupOption,
      CnLabBackupHistory
    ]),

    CnCoreModule,
    CnExternalLabApiModule,

    CnUsersModule,
    CnBricksModule,
    CnLabConfigsModule,
    CnGroupsModule,
    CnAuthModule,

    CnExperimentsModule,
    CnReportsModule,
    CnObjectStoragesModule,
    CnServerPriceModule,
    CnSupportModule,

    // Next modules are imported create lab automatically (lab free)
    CnCloudProvidersModule,
    CnServerCloudModule,
    CnSpacesModule,

    HttpModule
  ],
  providers: [
    CnLabInstancesService,
    CnLabInstanceAggregateService,
    CnLabManagerService,
    CnLabMailService,
    CnLabInstancesSecurity,
    CnLabInstanceUserService,
    CnLabServerService,
    CnOvhService,
    CnCloudProviderOvhService,
    CnLabConfigurerService,
    CnLabInstanceDesktopService,
    CnAzureService,
    CnCloudProviderAzureService,
    CnCloudProviderFactory,
    CnLabInstancesCron,
    CnLabGreenOptionService,
    CnLabFreeService,
    CnLabFreeAggregateService,
    CnLabInstanceStatusService,
    CnLabListener,
    CnLabBackupOptionService,
    CnLabBackupHistoryService,
    CnLabBackupAggregateService,
    CnCloudProviderOutscaleService,
    CnLabFactoryService
  ],
  exports: [
    CnLabInstancesService,
    CnLabInstanceAggregateService,
    CnLabMailService,
    CnLabInstanceUserService
  ],
  controllers: [CnLabInstancesController]
})
export class CnLabInstancesModule {
}
