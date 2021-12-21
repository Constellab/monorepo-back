import {Injectable} from '@nestjs/common';
import {CnAbstractSecurityLayer} from '../cn-core/class/cn-abstract-security.layer';
import {CnExperiment} from './cn-experiment.entity';
import {CnAbstractCheckAuthorization} from '../cn-core/security/cn-abstract-check.authorization';
import {CnExperimentsService} from './cn-experiments.service';
import {CnRefuseAuthorization} from '../cn-core/security/cn-refuse.authorization';
import {CnCreatedByAuthorization} from '../cn-core/security/cn-created-by.authorization';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {CnLabExperimentDto} from './cn-lab-experiment.dto';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';
import {CnProject} from '../cn-projects/cn-project.entity';

@Injectable()
export class CnExperimentsSecurityLayer extends CnAbstractSecurityLayer<CnExperiment> {

  private createdByAuthorization: CnAbstractCheckAuthorization = new CnCreatedByAuthorization();

  constructor(private service: CnExperimentsService,
              private projectsSecurityLayer: CnProjectsSecurityLayer) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new CnRefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: CnExperiment): Promise<boolean> {
    return await this.projectsSecurityLayer.isAuthorizedToFindById(dbEntity.projectId)
  }

  async isAuthorizedToUpdate(dbEntity: CnExperiment): Promise<boolean> {
    return this.createdByAuthorization.isAuthorized(dbEntity);
  }

  async getExperimentsOfProject(projectId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.projectsSecurityLayer.getAndCheckAuthorizationToFindById(projectId);

    return this.service.getExperimentsOfProject(projectId);
  }

  async getStatusHistory(id: string): Promise<CnExperimentStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as CnExperimentStatusHistory[];
  }

  async createLabExperiment(projectId: string, labExperimentDto: CnLabExperimentDto): Promise<void> {

    // check that the user can update the project
    const project: CnProject = await this.projectsSecurityLayer.getAndCheckAuthorizationToUpdateById(projectId);

    await this.service.createLabExperiment(project, labExperimentDto);

  }

}
