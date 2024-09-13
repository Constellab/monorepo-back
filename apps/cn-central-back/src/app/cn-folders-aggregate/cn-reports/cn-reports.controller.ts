import { Controller, Delete, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { CnReport } from './cn-report.entity';
import { Response } from 'express';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { BlResponseHelper, BlRichTextContent } from '@monorepo/back-core-lib';

@Controller('reports')
export class CnReportsController {

  constructor(private folderAggregateService: CnFolderAggregateService) {
  }

  @Get(':id/content')
  async getReportContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<BlRichTextContent> {
    return await this.folderAggregateService.findReportContent(id);
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnReport> {
    return await this.folderAggregateService.findReport(id);
  }


  @Get('experiment/:experimentId')
  async getReportsByExperiment(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnReport[]> {
    return await this.folderAggregateService.getReportAssociatedToExperiment(experimentId);
  }

  /**
   * Return a file (file or image) of the report
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':id/file/:filename(*)')
  public async getImage(@Param('id', new ParseUUIDPipe()) id: string,
                        @Param('filename') filename: string,
                        @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getReportFile(id, filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /**
   * Return a view of the report
   */
  @Get(':id/view/:viewId')
  public async getView(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('viewId') viewId: string,
                       @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getReportView(id, viewId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Delete(':id')
  public async deleteReport(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.folderAggregateService.deleteReport(id);
  }

}
