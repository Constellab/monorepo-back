import {Controller, Get, Param, ParseUUIDPipe} from '@nestjs/common';
import {CnReportsSecurityLayer} from './cn-reports-security.layer';
import {CnReport} from './cn-report.entity';

@Controller('reports')
export class CnReportsController {

  constructor(private securityLayer: CnReportsSecurityLayer) {
  }

  @Get('experiment/:experimentId')
  getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnReport[]> {
    return this.securityLayer.getReportsByExperiment(experimentId);
  }


}
