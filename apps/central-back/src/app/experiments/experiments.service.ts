import {BadRequestException, Injectable} from '@nestjs/common';
import {Experiment} from './experiment.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, getManager, Repository} from 'typeorm';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {ExperimentStatus} from './experiment-status.enum';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {ErrorText} from '../core/model/config/error-text.class';
import {ExternalLabExperimentService} from '../external-lab-api/external-lab-experiment.service';
import {Protocol} from '../protocols/protocol.entity';
import {User} from '../users/user.entity';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {ProtocolsService} from '../protocols/protocols.service';

@Injectable()
export class ExperimentsService extends AbstractWithStatusService<Experiment, ExperimentStatus> {

  constructor(@InjectRepository(Experiment) private repository: Repository<Experiment>,
              @InjectRepository(ExperimentStatusHistory) statusHistoRepo: Repository<ExperimentStatusHistory>,
              private externalLabExperimentService: ExternalLabExperimentService,
              private protocolsService: ProtocolsService) {
    super(repository, Experiment, statusHistoRepo, ExperimentStatusHistory);
  }

  async create(experiment: Experiment): Promise<Experiment> {
    // clear protocol it should not be create on experiment create
    delete experiment.protocol;

    return this.createWithStatus(experiment, ExperimentStatus.DRAFT);
  }

  protected async updateWithCompare(newEntity: Experiment, dbEntity: Experiment, entityManager?: EntityManager): Promise<Experiment> {
    // prevent protocol update here
    newEntity.protocol = dbEntity.protocol;
    return super.updateWithCompare(newEntity, dbEntity, entityManager);
  }

  async updateProtocol(dbEntity: Experiment, protocol: Protocol): Promise<Experiment> {
    this.checkProtocol(protocol);

    return await getManager().transaction(async entityManager => {

      const oldProtocolId: string = dbEntity.hasProtocol() ? dbEntity.protocol.id : null;

      // update the experiment protocol, if the protocol id is null it create a new protocol
      dbEntity.protocol = protocol;
      dbEntity = await this.updateWithCompare(dbEntity, dbEntity, entityManager);

      // delete the old protocol if no experiment use it
      if (oldProtocolId) {
        await this.protocolsService.deleteProtocolIfNotUsed(oldProtocolId, entityManager);
      }

      return dbEntity;
    });
  }

  async startExperiment(experiment: Experiment): Promise<Experiment> {
    if (experiment.protocol == null) {
      throw new BadRequestException(ErrorText.EXPERIMENT_MISSING_PROTOCOL);
    }
    this.checkProtocol(experiment.protocol);

    return await getManager().transaction(async entityManager => {
      // tell the lab that we created the experiment
      try {
        await this.externalLabExperimentService.createExperiment(experiment);
      } catch (e) {
        console.error(e.stack);
        throw new BadRequestException(e.message);
      }

      return this.updateCurrentStatusWithDbEntityTransaction(ExperimentStatus.STARTED, experiment, entityManager);
    });
  }


// method to verify that the protocol is a valid JSON
  private checkProtocol(protocol: Protocol): void {
    if (protocol == null) {
      return;
    }
    try {
      JSON.parse(protocol.json);
    } catch (e) {
      throw new BadRequestException(ErrorText.INVALID_PROTOCOL);
    }
  }


  getExperimentsOfStudy(studyId: string): Promise<Experiment[]> {
    return this.repository.find({
      where: {
        study: {id: studyId}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  // return the list of user's experiment that uses the protocol
  getCurrentExperimentByProtocol(protocolId: string): Promise<Experiment[]> {
    const user: User = RequestContextHelper.getAndCheckCurrentUser();
    return this.repository.find({
      where: {
        protocol: {id: protocolId},
        createdBy: {id: user.id}
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }
}
