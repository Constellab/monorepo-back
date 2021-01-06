import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {AbstractSecurityLayer} from '../core/class/abstract-security.layer';
import {Experiment} from './experiment.entity';
import {AbstractCheckAuthorization} from '../core/security/abstract-check.authorization';
import {ExperimentsService} from './experiments.service';
import {RefuseAuthorization} from '../core/security/refuse.authorization';
import {OwnerAuthorization} from '../core/security/owner.authorization';
import {ExperimentStatus} from './experiment-status.enum';
import {LabInstancesSecurityLayer} from '../lab-instances/lab-instances-security-layer.service';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {StudiesSecurityLayer} from '../studies/studies-security.layer';
import {ProtocolsSecurityLayer} from '../protocols/protocols-security-layer.service';
import {Protocol} from '../protocols/protocol.entity';
import {ErrorText} from '../core/model/config/error-text.class';

@Injectable()
export class ExperimentsSecurityLayer extends AbstractSecurityLayer<Experiment> {

  private ownerAuthorization: AbstractCheckAuthorization = new OwnerAuthorization();

  constructor(private service: ExperimentsService,
              private studiesSecurityLayer: StudiesSecurityLayer,
              private labInstanceSecurityLayer: LabInstancesSecurityLayer,
              private protocolSecurityLayer: ProtocolsSecurityLayer) {
    super(service);
  }

  async isAuthorizedToCreate(newEntity: Experiment): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToDelete(dbEntity: Experiment): Promise<boolean> {
    return new RefuseAuthorization().isAuthorized();
  }

  async isAuthorizedToFindOne(dbEntity: Experiment): Promise<boolean> {
    return this.ownerAuthorization.isAuthorized(dbEntity);
  }

  async isAuthorizedToUpdate(dbEntity: Experiment): Promise<boolean> {
    return this.ownerAuthorization.isAuthorized(dbEntity);
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

  async updateProtocol(experimentId: string, protocol: Protocol): Promise<Experiment> {
    const experiment: Experiment = await this.getAndCheckAuthorizationToUpdateById(experimentId);

    // the protocol can be updated only if the experiment is in DRAFT status
    if (experiment.currentStatus.status !== ExperimentStatus.DRAFT) {
      throw new UnauthorizedException();
    }

    // if the protocol already exists, check if the user can access it
    if (protocol.id) {
      await this.protocolSecurityLayer.getAndCheckAuthorizationToFindById(protocol.id);
    }

    return this.service.updateProtocol(experiment, protocol);
  }

  // the user can start an experiment if he can update the experiment and the experiment is DRAFT
  async startExperiment(experimentId: string): Promise<Experiment> {
    const experiment: Experiment = await this.getAndCheckAuthorizationToUpdateById(experimentId);

    if (experiment.currentStatus.status !== ExperimentStatus.DRAFT) {
      throw new UnauthorizedException();
    }

    if (!experiment.labInstance.isRunning()) {
      throw new BadRequestException(ErrorText.LAB_STOPPED);
    }

    return this.service.startExperiment(experiment);
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

  async getCurrentExperimentByProtocol(protocolId: string): Promise<Experiment[]> {
    await this.protocolSecurityLayer.getAndCheckAuthorizationToFindById(protocolId);

    return this.service.getCurrentExperimentByProtocol(protocolId);
  }

}
