import { Controller, Delete, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { CnReport } from './cn-report.entity';
import { Response } from 'express';
import { CnProjectAggregateService } from '../cn-project-aggregate.service';
import { BlResponseHelper, BlRichTextContent } from '@monorepo/back-core-lib';

@Controller('reports')
export class CnReportsController {

  constructor(private projectAggregator: CnProjectAggregateService) {
  }

  @Get(':id/content')
  async getReportContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<BlRichTextContent> {
    return await this.projectAggregator.findReportContent(id);
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnReport> {
    return await this.projectAggregator.findReport(id);
  }


  @Get('experiment/:experimentId')
  async getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnReport[]> {
    return await this.projectAggregator.getReportAssociatedToExperiment(experimentId);
  }

  /**
   * Return the list of reports of a project
   */
  @Get('project/:projectId')
  public async getReportByProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<CnReport[]> {
    return await this.projectAggregator.getReportsByProject(projectId);
  }

  /**
   * Return an image of the report
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':id/image/:filename(*)')
  public async getImage(@Param('id', new ParseUUIDPipe()) id: string,
                        @Param('filename') filename: string,
                        @Res() response: Response): Promise<any> {
    const file = await this.projectAggregator.getReportImage(id, filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /**
   * Return a view of the report
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':id/view/:filename(*)')
  public async getView(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('filename') filename: string,
                       @Res() response: Response): Promise<any> {
    const file = await this.projectAggregator.getReportView(id, filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Delete(':id')
  public async deleteReport(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.projectAggregator.deleteReport(id);
  }

}
