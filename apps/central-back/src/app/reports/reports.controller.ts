import {Controller, Get, Param, ParseUUIDPipe} from '@nestjs/common';
import {ReportsSecurityLayer} from './reports-security.layer';
import {Report} from './report.entity';

@Controller('reports')
export class ReportsController {

  constructor(private securityLayer: ReportsSecurityLayer) {
  }

  @Get('experiment/:experimentId')
  getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<Report[]> {
    return this.securityLayer.getReportsByExperiment(experimentId);
  }


}
