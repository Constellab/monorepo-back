import {Controller, Get, Param, ParseUUIDPipe} from '@nestjs/common';
import {CnReportsSecurityLayer} from './cn-reports-security.layer';
import {CnReportDTO} from './cn-report.dto';
import {CnReport} from './cn-report.entity';

@Controller('reports')
export class CnReportsController {

  constructor(private securityLayer: CnReportsSecurityLayer) {
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnReport> {
    return await this.securityLayer.findByIdAndCheck(id);
  }

  @Get('experiment/:experimentId')
  async getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnReportDTO[]> {
    const reports = await this.securityLayer.getReportsByExperiment(experimentId);
    return reports.map(report => new CnReportDTO().copyEntity(report));
  }

  /**
   * Return the list of reports of a project
   */
  @Get('project/:projectId')
  public async getExperimentByProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<CnReportDTO[]> {
    const reports = await this.securityLayer.getExperimentsByProject(projectId);
    return reports.map(report => new CnReportDTO().copyEntity(report));
  }


}
