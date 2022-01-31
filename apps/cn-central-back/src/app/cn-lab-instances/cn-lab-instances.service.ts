import {BadRequestException, Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstance} from './cn-lab-instance.entity';
import {DeleteResult, EntityManager, ObjectLiteral, Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnLabInstanceStatus} from './cn-lab-instance-status.enum';
import {CnAbstractWithStatusService} from '../cn-core/class/cn-abstract-with-status.service';
import {CnLabInstanceStatusHistory} from './cn-lab-instance-status-history.entity';
import {CnExternalLabUserService} from '../cn-external-lab-api/cn-external-lab-user.service';
import {
  CnExternalLabLoginResponse,
  CnExternalLabUser,
  CnExternalNewLabUser
} from '../cn-external-lab-api/model/cn-external-lab-api.class';
import {CnLabInstanceToken} from './cn-lab-instance-token.class';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnExternalLabError} from '../cn-external-lab-api/model/cn-external-lab-error.class';
import {AxiosResponse} from 'axios';
import {ClPageI} from '@monorepo/core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnExternalLabApiService} from '../cn-external-lab-api/cn-external-lab-api.service';
import {CnExperiment} from '../cn-experiments/cn-experiment.entity';
import {CnExperimentsService} from '../cn-experiments/cn-experiments.service';

@Injectable()
export class CnLabInstancesService extends CnAbstractWithStatusService<CnLabInstance, CnLabInstanceStatus> {

  private readonly logger = new Logger(CnLabInstancesService.name);

  constructor(@InjectRepository(CnLabInstance) private repository: Repository<CnLabInstance>,
              @InjectRepository(CnLabInstanceStatusHistory) statusHistoRepo: Repository<CnLabInstanceStatusHistory>,
              private externalLabUserService: CnExternalLabUserService,
              private externalLabApiService: CnExternalLabApiService,
              private userService: CnUsersService,
              private experimentService: CnExperimentsService) {
    super(repository, CnLabInstance, statusHistoRepo, CnLabInstanceStatusHistory);
  }


  async create(entity: CnLabInstance): Promise<CnLabInstance> {
    return super.createWithStatus(entity, CnLabInstanceStatus.STOPPED);
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const experiments: CnExperiment[] = await this.experimentService.getExperimentsByLabInstance(id);

    if (experiments?.length > 0) {
      throw new BadRequestException('Can\'t delete the lab instance because some experiment are linked to it');
    }

    return super.deleteById(id, entityManager);
  }

  public getCurrentLabInstances(page: number, size: number): Promise<ClPageI<CnLabInstance>> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {owner: user.id},
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public getCurrentRunningLabInstances(): Promise<CnLabInstance[]> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    // TODO fix this route, problem to filter on status because user also has a status
    return this.repository.find({
      where: (qb: ObjectLiteral) => {
        qb.where({owner: user.id})
          .andWhere('sh.status = :status', {status: CnLabInstanceStatus.RUNNING});
      },
      // join: {alias: 'lll', leftJoinAndSelect: {sh: 'currentStatus'}},
      // join: {},
      order: {lastModifiedAt: 'DESC'},
    });
  }

  public startInstance(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatus(CnLabInstanceStatus.RUNNING, id);
  }

  public stopInstance(id: string): Promise<CnLabInstance> {
    return this.updateCurrentStatus(CnLabInstanceStatus.STOPPED, id);
  }

  public async login(labInstance: CnLabInstance): Promise<CnLabInstanceToken> {
    try {
      const labAuth: CnExternalLabLoginResponse =
        await this.externalLabUserService.login(labInstance.getGlabApiInfo(), CnCurrentUserHelper.getAndCheckCurrentUser());

      return new CnLabInstanceToken(labInstance, 'Bearer ' + labAuth.access_token);
    } catch (e: any) {
      const error: CnExternalLabError = (e.response as AxiosResponse)?.data ?? '';

      switch (error.code) {
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_ACTIVATED' :
          throw new UnauthorizedException(CnErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws_core.WRONG_CREDENTIALS_USER_NOT_FOUND' :
          throw new UnauthorizedException(CnErrorText.LAB_USER_NOT_FOUND);
        default:
          this.logger.error(e);
          throw new BadRequestException(CnErrorText.LAB_AUTH_ERROR);
      }
    }
  }

  public findLabByApiKey(apiKey: string): Promise<CnLabInstance> {
    return this.repository.findOne({
      where: {
        glabApiKey: apiKey
      }
    });
  }


  public findAll(): Promise<CnLabInstance[]> {
    return this.repository.find(
      {
        order: {lastModifiedAt: 'DESC'},
      },
    );
  }

  public async getLabUsers(labInstanceId: string): Promise<CnExternalLabUser[]> {
    const lab: CnLabInstance = await this.findByIdAndCheck(labInstanceId);

    return this.externalLabUserService.getUsers(lab.getGlabApiInfo());
  }

  public async addUserToLab(labInstanceId: string, newUser: CnExternalNewLabUser): Promise<CnExternalLabUser> {
    const lab: CnLabInstance = await this.findByIdAndCheck(labInstanceId);
    const user: CnUser = await this.userService.findByIdAndCheck(newUser.userId);

    return this.externalLabUserService.addUser(lab.getGlabApiInfo(), user, newUser.group);
  }

  public async updateName(labInstanceId: string, name: string): Promise<CnLabInstance> {
    const lab: CnLabInstance = await this.findByIdAndCheck(labInstanceId);
    lab.name = name;
    return this.repository.save(lab);
  }

  public async checkStatus(labInstanceId: string): Promise<any> {
    const lab: CnLabInstance = await this.findByIdAndCheck(labInstanceId);

    try {
      await this.externalLabApiService.healthCheck(lab.getGlabApiInfo());
    } catch {
      throw new BadRequestException('The lab is not running');
    }

    try {
      return await this.externalLabApiService.getSettings(lab.getGlabApiInfo());
    } catch {
      throw new BadRequestException('Can\'t retrieve the settings');
    }
  }
}
