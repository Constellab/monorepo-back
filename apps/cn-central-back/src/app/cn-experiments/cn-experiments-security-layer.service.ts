import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnExperiment} from './cn-experiment.entity';
import {CnExperimentsService} from './cn-experiments.service';
import {CnCreateLabExperimentDto} from './cn-experiment.dto';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnReportsSecurityLayer} from '../cn-reports/cn-reports-security.layer';

@Injectable()
export class CnExperimentsSecurityLayer extends CnAbstractSecurityLayer<CnExperiment> {

  constructor(private service: CnExperimentsService,
              private projectsSecurityLayer: CnProjectsSecurityLayer,
              private reportSecurityLayer: CnReportsSecurityLayer) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return false;
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return false;
  }

  async isAuthorizedToFindOne(dbEntity: CnExperiment): Promise<boolean> {
    return await this.projectsSecurityLayer.isAuthorizedToFindById(dbEntity.projectId);
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return false;
  }

  async getExperimentsByProject(projectId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.projectsSecurityLayer.getAndCheckAuthorizationToFindById(projectId);

    return this.service.getExperimentsByProject(projectId);
  }

  async getExperimentsByReports(reportId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.reportSecurityLayer.getAndCheckAuthorizationToFindById(reportId);

    return this.service.getExperimentsByReport(reportId);
  }

  async createLabExperiment(projectId: string, createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    // check that the user can update the project
    const project: CnProject = await this.projectsSecurityLayer.getAndCheckAuthorizationToUpdateById(projectId);

    await this.service.createLabExperiment(project, createLabExperimentDto);

  }

}
