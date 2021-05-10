import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Experiment} from './experiment.entity';
import {AbstractCheckAuthorization} from '../core/security/abstract-check.authorization';
import {ExperimentsService} from './experiments.service';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {CreatedByAuthorization} from '../core/security/created-by.authorization';
import {ExperimentStatus} from './experiment-status.enum';
import {LabInstancesSecurityLayer} from '../lab-instances/lab-instances-security-layer.service';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {StudiesSecurityLayer} from '../studies/studies-security.layer';

@Injectable()
export class ExperimentsSecurityLayer extends AbstractSecurityLayer<Experiment> {

  private createdByAuthorization: AbstractCheckAuthorization = new CreatedByAuthorization();

  constructor(private service: ExperimentsService,
              private studiesSecurityLayer: StudiesSecurityLayer,
              private labInstanceSecurityLayer: LabInstancesSecurityLayer) {
    super(service);
  }

  async isAuthorizedToCreate(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Experiment): Promise<boolean> {
    return this.createdByAuthorization.isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: Experiment): Promise<boolean> {
    return this.createdByAuthorization.isAuthorized(dbEntity);
  }


  async createExperiment(experiment: Experiment, studyId: string): Promise<Experiment> {
    // check that the user can update the study
    experiment.study = await this.studiesSecurityLayer.getAndCheckAuthorizationToUpdateById(studyId);

    // check that the user can update the lab instance
    if (experiment.labInstance == null) {
      throw new UnauthorizedException();
    }
    experiment.labInstance = await this.labInstanceSecurityLayer.getAndCheckAuthorizationToUpdateById(experiment.labInstance.id);

    return this.service.create(experiment);
  }

  async updateCurrentStatus(status: ExperimentStatus, id: string): Promise<Experiment> {
    const experiment: Experiment = await this.getAndCheckAuthorizationToUpdateById(id);

    return this.service.updateCurrentStatusWithDbEntity(status, experiment);
  }

  async getExperimentsOfStudy(studyId: string): Promise<Experiment[]> {
    // check that the user can get the project
    await this.studiesSecurityLayer.getAndCheckAuthorizationToFindById(studyId);

    return this.service.getExperimentsOfStudy(studyId);
  }

  async getStatusHistory(id: string): Promise<ExperimentStatusHistory[]> {
    // check that the user can get experiment
    await this.getAndCheckAuthorizationToFindById(id);

    return await this.service.getStatusHistory(id) as ExperimentStatusHistory[];
  }


}
