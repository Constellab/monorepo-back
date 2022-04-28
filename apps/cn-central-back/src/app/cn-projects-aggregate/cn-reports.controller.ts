import {Controller, Get, Param, ParseUUIDPipe, Res} from '@nestjs/common';
import {CnReportDTO} from './cn-reports/cn-report.dto';
import {CnReport} from './cn-reports/cn-report.entity';
import {Response} from 'express';
import {CnProjectAggregateService} from './cn-project-aggregate.service';

@Controller('reports')
export class CnReportsController {

  constructor(private projectAggregator: CnProjectAggregateService) {
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnReport> {
    return await this.projectAggregator.findReport(id);
  }

  @Get('experiment/:experimentId')
  async getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnReportDTO[]> {
    const reports = await this.projectAggregator.getReportAssociatedToExperiment(experimentId);
    return reports.map(report => new CnReportDTO().copyEntity(report));
  }

  /**
   * Return the list of reports of a project
   */
  @Get('project/:projectId')
  public async getReportByProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<CnReportDTO[]> {
    const reports = await this.projectAggregator.getReportsByProject(projectId);
    return reports.map(report => new CnReportDTO().copyEntity(report));
  }

  /**
   * Return an image of the report
   */
  @Get('image/:filename')
  public async getImage(@Param('filename') filename: string,
                   @Res() response: Response): Promise<any> {
    const file = await this.projectAggregator.getReportImage(filename);
    file.pipe(response);
  }

  /**
   * Return a view of the report
   */
  @Get('view/:filename')
  public async getView(@Param('filename') filename: string,
  @Res() response: Response): Promise<any> {
    const file = await this.projectAggregator.getReportView(filename);
    file.pipe(response);
  }


}
