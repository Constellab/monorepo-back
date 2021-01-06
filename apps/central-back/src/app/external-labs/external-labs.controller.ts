import {Controller, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {ParseEnumPipe} from '../core/pipes/parse-enum.pipe';
import {LabInstanceStatus} from '../lab-instances/lab-instance-status.enum';
import {LabInstance} from '../lab-instances/lab-instance.entity';
import {LabInstancesService} from '../lab-instances/lab-instances.service';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {LabGuard} from '../core/decorators/lab-guard.decorator';
import {ReportsSecurityLayer} from '../reports/reports-security.layer';
import {Report} from '../reports/report.entity';

/**
 * Specific controller for route called by the lab servers. Theses route are not called by a user
 */
@LabGuard()
@Controller('external-labs')
export class ExternalLabsController {

  constructor(private labInstanceService: LabInstancesService,
              private reportSecurityLayer: ReportsSecurityLayer) {
  }

  @Put('/lab-instance/status/:status')
  updateLabInstanceStatus(
    @Param('status', new ParseEnumPipe(LabInstanceStatus)) status: LabInstanceStatus): Promise<LabInstance> {
    return this.labInstanceService.updateCurrentStatus(status, RequestContextHelper.getAndCheckCurrentLabInstance().id);
  }

  @Post(':experimentId/report')
  saveReportForExperiment(
    @Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<Report> {
    // todo send the object
    return this.reportSecurityLayer.createReport(null, experimentId);
  }
}
