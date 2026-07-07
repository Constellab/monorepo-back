import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { CnCoreModule } from '../cn-core/cn-core.module';
import { CnLabConfigsModule } from '../cn-lab-configs/cn-lab-configs.module';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { CnExternalLabFolderService } from './cn-external-lab-folder.service';
import { CnExternalLabManagerApiService } from './cn-external-lab-manager-api.service';
import { CnExternalLabObjectService } from './cn-external-lab-object.service';
import { CnExternalLabShareService } from './cn-external-lab-share.service';
import { CnExternalLabUserService } from './cn-external-lab-user.service';

/**
 * Module for outgoing api call to the labs
 */
@Module({
  imports: [CnCoreModule, HttpModule, CnLabConfigsModule],
  providers: [
    CnExternalLabApiService,
    CnExternalLabUserService,
    CnExternalLabFolderService,
    CnExternalLabManagerApiService,
    CnExternalLabShareService,
    CnExternalLabObjectService,
  ],

  exports: [
    CnExternalLabApiService,
    CnExternalLabUserService,
    CnExternalLabFolderService,
    CnExternalLabManagerApiService,
    CnExternalLabShareService,
    CnExternalLabObjectService,
  ],
})
export class CnExternalLabApiModule {}
