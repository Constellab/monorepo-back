import { Module } from '@nestjs/common';
import { CnLabsService } from './cn-labs.service';
import { CnLabsController } from './cn-labs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnLabEntity } from './cn-lab.entity';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnScenariosModule } from '../cn-folders-aggregate/cn-scenarios/cn-scenarios.module';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnBricksModule } from '../cn-bricks/cn-bricks.module';
import { CnLabConfigsModule } from '../cn-lab-configs/cn-lab-configs.module';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnLabsSecurity } from './cn-labs.security';
import { CnLabUser } from './user/cn-lab-user.entity';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabUserService } from './user/cn-lab-user.service';
import { CnNotesModule } from '../cn-folders-aggregate/cn-notes/cn-notes.module';
import { CnObjectStoragesModule } from '../cn-object-storages/cn-object-storages.module';
import { CnOvhService } from './server/ovh/cn-ovh.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnCloudProviderOvhService } from './server/ovh/cn-cloud-provider-ovh.service';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnLabDesktopService } from './desktop/cn-lab-desktop.service';
import { HttpModule } from '@nestjs/axios';
import { CnLabCron } from './cn-lab.cron';
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
import { CnLabListener } from './cn-lab.listener';
import { CnLabFreeAggregateService } from './lab-free/cn-lab-free-aggregate.service';
import { CnLabFree } from './lab-free/cn-lab-free.entity';
import { CnLabBackupOption } from './backup/cn-lab-backup-option.entity';
import { CnLabBackupHistoryEntity } from './backup/cn-lab-backup-history.entity';
import { CnLabBackupOptionService } from './backup/cn-lab-backup-option.service';
import { CnLabBackupHistoryService } from './backup/cn-lab-backup-history.service';
import { CnCloudProviderOutscaleService } from './server/outscale/cn-cloud-provider-outscale.service';
import { CnServerPriceModule } from '../cn-servers-info/server-price/cn-server-price.module';
import { CnLabFactoryService } from './cn-lab-factory.service';
import { CnLabBackupAggregateService } from './backup/cn-lab-backup-aggregate.service';
import { CnSupportModule } from '../cn-support/cn-support.module';
import { CnLabBackupHistoryDetail } from './backup/cn-lab-backup-history-detail.entity';
import { CnLabVolumeEntity } from './volume/cn-lab-volume-entity';
import { CnLabVolumeService } from './volume/cn-lab-volume.service';
import { CnStoragePriceModule } from '../cn-servers-info/storage-price/cn-storage-price.module';
import { CnLabStatusHistoryService } from './status/cn-lab-status-history.service';
import { CnLabStatsAggregateService } from './stats/cn-lab-stats-aggregate.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabEntity,
      CnLabStatusHistory,
      CnLabUser,
      CnLabGreenOption,
      CnLabFree,
      CnLabBackupOption,
      CnLabBackupHistoryEntity,
      CnLabBackupHistoryDetail,
      CnLabVolumeEntity,
    ]),

    CnCoreModule,
    CnExternalLabApiModule,

    CnUsersModule,
    CnBricksModule,
    CnLabConfigsModule,
    CnGroupsModule,
    CnAuthModule,

    CnScenariosModule,
    CnNotesModule,
    CnObjectStoragesModule,
    CnServerPriceModule,
    CnSupportModule,
    CnStoragePriceModule,

    // Next modules are imported create lab automatically (lab free)
    CnCloudProvidersModule,
    CnServerCloudModule,
    CnSpacesModule,

    HttpModule,
  ],
  providers: [
    CnLabsService,
    CnLabAggregateService,
    CnLabManagerService,
    CnLabMailService,
    CnLabsSecurity,
    CnLabUserService,
    CnLabServerService,
    CnOvhService,
    CnCloudProviderOvhService,
    CnLabConfigurerService,
    CnLabDesktopService,
    CnAzureService,
    CnCloudProviderAzureService,
    CnCloudProviderFactory,
    CnLabCron,
    CnLabGreenOptionService,
    CnLabFreeService,
    CnLabFreeAggregateService,
    CnLabListener,
    CnLabBackupOptionService,
    CnLabBackupHistoryService,
    CnLabBackupAggregateService,
    CnCloudProviderOutscaleService,
    CnLabFactoryService,
    CnLabVolumeService,
    CnLabStatusHistoryService,
    CnLabStatsAggregateService,
  ],
  exports: [CnLabsService, CnLabAggregateService, CnLabMailService, CnLabUserService],
  controllers: [CnLabsController],
})
export class CnLabsModule {}
