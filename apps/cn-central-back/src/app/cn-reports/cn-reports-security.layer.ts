import {forwardRef, Inject, Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnReport} from './cn-report.entity';
import {CnRefuseAuthorization} from '../cn-core/security/cn-refuse.authorization';
import {CnReportsService} from './cn-reports.service';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';
import {CnCreateReportDto} from './cn-report.dto';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnExperimentsSecurityLayer} from '../cn-experiments/cn-experiments-security-layer.service';
import {BlFile} from '@monorepo/back-core-lib';

@Injectable()
export class CnReportsSecurityLayer extends CnAbstractSecurityLayer<CnReport> {

  constructor(private service: CnReportsService,
              private projectsSecurityLayer: CnProjectsSecurityLayer,
              @Inject(forwardRef(() => CnExperimentsSecurityLayer)) private experimentSecurityLayer: CnExperimentsSecurityLayer) {
    super(service);
  }

  // not used
  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: CnReport): Promise<boolean> {
    return await this.projectsSecurityLayer.isAuthorizedToFindById(dbEntity.projectId);
  }

  async isAuthorizedToUpdate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async createReport(createReportDto: CnCreateReportDto, projectId: string, files: BlFile[]): Promise<CnReport> {
    const project: CnProject = await this.projectsSecurityLayer.getAndCheckAuthorizationToUpdateById(projectId);
    return this.service.createReport(createReportDto, project, files);
  }

  async getReportsByExperiment(experimentId: string): Promise<CnReport[]> {
    await this.experimentSecurityLayer.getAndCheckAuthorizationToFindById(experimentId);

    return this.service.getReportsByExperiment(experimentId);
  }

  async getExperimentsByProject(projectId: string): Promise<CnReport[]> {
    // check that the user can get the project
    await this.projectsSecurityLayer.getAndCheckAuthorizationToFindById(projectId);

    return this.service.getReportsByProject(projectId);
  }

}
