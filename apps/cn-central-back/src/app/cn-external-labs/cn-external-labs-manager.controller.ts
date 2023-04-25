import {Controller, Get} from '@nestjs/common';
import {CnLabInstanceAggregateService} from '../cn-lab-instances/cn-lab-instance-aggregate.service';
import {CnExternalLabBackupInfoDto} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {CnLabManagerGuard} from '../cn-core/decorators/cn-lab-manager-guard.decorator';
import {CnLabRobotAuthentication} from '../cn-core/decorators/cn-lab-guard.decorator';

/**
 * Specific controller for route called by the lab manager. These routes are not called by a user
 */
@CnLabManagerGuard()
@Controller('external-labs-manager')
export class CnExternalLabsManagerController {

  constructor(private labInstanceAggregator: CnLabInstanceAggregateService) {
  }

  @CnLabRobotAuthentication()
  @Get('lab/backup-info')
  async getLabBackupInfo(): Promise<CnExternalLabBackupInfoDto> {
    return this.labInstanceAggregator.getCurrentLabInstanceBackupInfo();
  }
}
