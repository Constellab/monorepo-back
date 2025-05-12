import { Injectable } from '@nestjs/common';
import { CnExternalLabApiService } from './cn-external-lab-api.service';
import { CnLabGlabApiInfo } from '../cn-labs/cn-lab.dto';
import { lastValueFrom } from 'rxjs';
import { BlVersion } from '@monorepo/back-core-lib';
import { CnExternalLabSyncedObjectDTO } from './model/cn-external-lab-api.class';

@Injectable()
export class CnExternalLabObjectService {
  // version of gws_core from which the sync route is available
  private readonly syncRouteAvailability: string = '0.14.6';

  constructor(private externalLabApiService: CnExternalLabApiService) {}

  public async syncNoteWithLab(
    glabApiInfo: CnLabGlabApiInfo,
    note: CnExternalLabSyncedObjectDTO
  ): Promise<void> {
    if (glabApiInfo.gwsCoreVersion.isLower(BlVersion.fromString(this.syncRouteAvailability))) {
      return;
    }
    return lastValueFrom(this.externalLabApiService.put(glabApiInfo.apiInfo, `note/sync`, note));
  }

  public async syncScenarioWithLab(
    glabApiInfo: CnLabGlabApiInfo,
    scenario: CnExternalLabSyncedObjectDTO
  ): Promise<void> {
    if (glabApiInfo.gwsCoreVersion.isLower(BlVersion.fromString(this.syncRouteAvailability))) {
      return;
    }
    return lastValueFrom(this.externalLabApiService.put(glabApiInfo.apiInfo, `scenario/sync`, scenario));
  }
}
