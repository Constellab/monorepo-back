import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnAuthModule } from '../cn-auth/cn-auth.module';
import { CnBricksModule } from '../cn-bricks/cn-bricks.module';
import { CnCloudProvidersModule } from '../cn-cloud-providers/cn-cloud-providers.module';
import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnExternalLabApiModule } from '../cn-external-lab-api/cn-external-lab-api.module';
import { CnNotesModule } from '../cn-folders-aggregate/cn-notes/cn-notes.module';
import { CnScenariosModule } from '../cn-folders-aggregate/cn-scenarios/cn-scenarios.module';
import { CnGroupsModule } from '../cn-groups/cn-groups.module';
import { CnLabConfigsModule } from '../cn-lab-configs/cn-lab-configs.module';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnObjectStoragesModule } from '../cn-object-storages/cn-object-storages.module';
import { CnServerCloudModule } from '../cn-servers-info/server-cloud/cn-server-cloud.module';
import { CnServerPriceModule } from '../cn-servers-info/server-price/cn-server-price.module';
import { CnStoragePriceModule } from '../cn-servers-info/storage-price/cn-storage-price.module';
import { CnSpacesModule } from '../cn-spaces/cn-spaces.module';
import { CnSupportModule } from '../cn-support/cn-support.module';
import { CnUsersModule } from '../cn-users/cn-users.module';
import { CnLabBackupEventService } from './backup/cn-lab-backup.event';
import { CnLabBackupListener } from './backup/cn-lab-backup.listener';
import { CnLabBackupAggregateService } from './backup/cn-lab-backup-aggregate.service';
import { CnLabBackupHistoryEntity } from './backup/cn-lab-backup-history.entity';
import { CnLabBackupHistoryService } from './backup/cn-lab-backup-history.service';
import { CnLabBackupHistoryDetail } from './backup/cn-lab-backup-history-detail.entity';
import { CnLabBackupOption } from './backup/cn-lab-backup-option.entity';
import { CnLabBackupOptionService } from './backup/cn-lab-backup-option.service';
import { CnLabCron } from './cn-lab.cron';
import { CnLabEntity } from './cn-lab.entity';
import { CnLabListener } from './cn-lab.listener';
import { CnLabAggregateService } from './cn-lab-aggregate.service';
import { CnLabFactoryService } from './cn-lab-factory.service';
import { CnLabManagerService } from './cn-lab-manager.service';
import { CnLabsController } from './cn-labs.controller';
import { CnLabsSecurity } from './cn-labs.security';
import { CnLabsService } from './cn-labs.service';
import { CnLabDesktopService } from './desktop/cn-lab-desktop.service';
import { CnLabGreenOption } from './green-option/cn-lab-green-option.entity';
import { CnLabGreenOptionService } from './green-option/cn-lab-green-option.service';
import { CnLabFree } from './lab-free/cn-lab-free.entity';
import { CnLabFreeService } from './lab-free/cn-lab-free.service';
import { CnLabFreeAggregateService } from './lab-free/cn-lab-free-aggregate.service';
import { CnLabMailService } from './mail/cn-lab-mail.service';
import { CnLabMigrateService } from './migration/cn-lab-migrate.service';
import { CnLabMigrationRegistryService } from './migration/cn-lab-migration-registry.service';
import { CnLabNotificationService } from './notification/cn-lab-notification.service';
import { CnAzureService } from './server/azure/cn-azure.service';
import { CnCloudProviderAzureService } from './server/azure/cn-cloud-provider-azure.service';
import { CnCloudProviderFactory } from './server/cn-cloud-provider.factory';
import { CnLabConfigurerService } from './server/cn-lab-configurer.service';
import { CnLabServerService } from './server/cn-lab-server.service';
import { CnCloudProviderGcpService } from './server/gcp/cn-cloud-provider-gcp.service';
import { CnGcpService } from './server/gcp/cn-gcp.service';
import { CnCloudProviderOutscaleService } from './server/outscale/cn-cloud-provider-outscale.service';
import { CnCloudProviderOvhService } from './server/ovh/cn-cloud-provider-ovh.service';
import { CnOvhService } from './server/ovh/cn-ovh.service';
import { CnLabStatsAggregateService } from './stats/cn-lab-stats-aggregate.service';
import { CnLabStatusHistory } from './status/cn-lab-status-history.entity';
import { CnLabStatusHistoryService } from './status/cn-lab-status-history.service';
import { CnLabUserEntity } from './user/cn-lab-user.entity';
import { CnLabUserService } from './user/cn-lab-user.service';
import { CnLabVolumeService } from './volume/cn-lab-volume.service';
import { CnLabVolumeEntity } from './volume/cn-lab-volume-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnLabEntity,
      CnLabStatusHistory,
      CnLabUserEntity,
      CnLabGreenOption,
      CnLabFree,
      CnLabBackupOption,
      CnLabBackupHistoryEntity,
      CnLabBackupHistoryDetail,
      CnLabVolumeEntity,
    ]),

    CnCoreModule,
    CnExternalLabApiModule,
    CnNotificationModule,

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
    CnLabMigrateService,
    CnLabMailService,
    CnLabNotificationService,
    CnLabsSecurity,
    CnLabUserService,
    CnLabServerService,
    CnOvhService,
    CnCloudProviderOvhService,
    CnLabConfigurerService,
    CnLabDesktopService,
    CnAzureService,
    CnCloudProviderAzureService,
    CnGcpService,
    CnCloudProviderGcpService,
    CnCloudProviderFactory,
    CnLabCron,
    CnLabGreenOptionService,
    CnLabFreeService,
    CnLabFreeAggregateService,
    CnLabListener,
    CnLabBackupOptionService,
    CnLabBackupEventService,
    CnLabBackupListener,
    CnLabBackupHistoryService,
    CnLabBackupAggregateService,
    CnCloudProviderOutscaleService,
    CnLabFactoryService,
    CnLabVolumeService,
    CnLabStatusHistoryService,
    CnLabStatsAggregateService,
    // Migration system
    CnLabMigrationRegistryService,
  ],
  exports: [
    CnLabsService,
    CnLabAggregateService,
    CnLabMailService,
    CnLabNotificationService,
    CnLabUserService,
    CnLabMigrateService,
  ],
  controllers: [CnLabsController],
})
export class CnLabsModule {}
