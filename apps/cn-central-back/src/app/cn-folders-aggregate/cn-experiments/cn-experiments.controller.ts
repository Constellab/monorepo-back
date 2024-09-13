import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CnExperiment, CnExperimentProtocol } from './cn-experiment.entity';
import { CnExperimentDTO } from './cn-experiment.dto';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';

@Controller('experiments')
export class CnExperimentsController {

  constructor(private folderAggregateService: CnFolderAggregateService) {
  }


  @Get('current-last-experiments')
  getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return this.folderAggregateService.getCurrentUserLastExperiments();
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExperiment> {
    return this.folderAggregateService.findExperiment(id);
  }


  /**
   * Return the list of experiment of a folder
   */
  @Get('folder/:folderId')
  public async getExperimentsByFolder(@Param('folderId', ParseUUIDPipe) folderId: string): Promise<CnExperimentDTO[]> {
    const experiments = await this.folderAggregateService.getExperimentsByFolder(folderId);
    return experiments.map(experiment => new CnExperimentDTO().copyEntity(experiment));
  }

  @Get('report/:reportId')
  async getExperimentsByReport(@Param('reportId', new ParseUUIDPipe()) reportId: string): Promise<CnExperimentDTO[]> {
    const experiments = await this.folderAggregateService.getExperimentsAssociatedToReports(reportId);
    return experiments.map(experiment => new CnExperimentDTO().copyEntity(experiment));
  }

  /**
   * Get experiment's reports
   */
  @Get(':experimentId/technical-report')
  async getExperimentTechnicalReport(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnExperimentProtocol> {
    return this.folderAggregateService.findExperimentTechnicalReport(experimentId);
  }

  /**
   * Get experiment's lab config
   */
  @Get(':experimentId/lab-config')
  async getExperimentLabConfig(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnLabConfig> {
    return this.folderAggregateService.findExperimentLabConfig(experimentId);
  }

}
