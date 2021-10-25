import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {LabInstance} from './lab-instance.entity';
import {ObjectLiteral, Repository} from 'typeorm';
import {User} from '../users/user.entity';
import {LabInstanceStatus} from './lab-instance-status.enum';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {ExternalLabUserService} from '../external-lab-api/external-lab-user.service';
import {ExternalLabLoginResponse, ExternalLabUser, ExternalNewLabUser} from '../external-lab-api/external-lab-api.class';
import {LabInstanceToken} from './lab-instance-token.class';
import {ErrorText} from '../core/model/config/error-text.class';
import {UsersService} from '../users/users.service';
import {ExternalLabError} from '../external-lab-api/external-lab-error.class';
import {AxiosResponse} from 'axios';
import {ClPageI} from '@monorepo/core-lib';
import {CurrentUserHelper} from '../core/utils/current-user.helper';
import {ExternalLabApiService} from '../external-lab-api/external-lab-api.service';

@Injectable()
export class LabInstancesService extends AbstractWithStatusService<LabInstance, LabInstanceStatus> {

  constructor(@InjectRepository(LabInstance) private repository: Repository<LabInstance>,
              @InjectRepository(LabInstanceStatusHistory) statusHistoRepo: Repository<LabInstanceStatusHistory>,
              private externalLabUserService: ExternalLabUserService,
              private externalLabApiService: ExternalLabApiService,
              private userService: UsersService) {
    super(repository, LabInstance, statusHistoRepo, LabInstanceStatusHistory);
  }


  async create(entity: LabInstance): Promise<LabInstance> {
    return super.createWithStatus(entity, LabInstanceStatus.STOPPED);
  }

  public getCurrentLabInstances(page: number, size: number): Promise<ClPageI<LabInstance>> {
    const user: User = CurrentUserHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {owner: user.id},
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public getCurrentRunningLabInstances(): Promise<LabInstance[]> {
    const user: User = CurrentUserHelper.getAndCheckCurrentUser();

    return this.repository.find({
      where: (qb: ObjectLiteral) => {
        qb.where({owner: user.id})
          .andWhere('status = :status', {status: LabInstanceStatus.RUNNING});
      },
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public startInstance(id: string): Promise<LabInstance> {
    return this.updateCurrentStatus(LabInstanceStatus.RUNNING, id);
  }

  public stopInstance(id: string): Promise<LabInstance> {
    return this.updateCurrentStatus(LabInstanceStatus.STOPPED, id);
  }

  public async login(labInstance: LabInstance): Promise<LabInstanceToken> {
    try {
      const labAuth: ExternalLabLoginResponse =
        await this.externalLabUserService.login(labInstance, CurrentUserHelper.getAndCheckCurrentUser());

      return new LabInstanceToken(labInstance, 'Bearer ' + labAuth.access_token);
    } catch (e: any) {
      const error: ExternalLabError = (e.response as AxiosResponse)?.data ?? '';

      switch (error.code) {
        case 'gws.WRONG_CREDENTIALS_USER_NOT_ACTIVATED' :
          throw new UnauthorizedException(ErrorText.LAB_USER_NOT_ACTIVATED);
        case 'gws.WRONG_CREDENTIALS_USER_NOT_FOUND' :
          throw new UnauthorizedException(ErrorText.LAB_USER_NOT_FOUND);
        default:
          throw new BadRequestException(ErrorText.LAB_AUTH_ERROR);

      }
    }
  }

  public findLabByApiKey(apiKey: string): Promise<LabInstance> {
    return this.repository.findOne({
      where: {
        apiKey: apiKey
      }
    });
  }


  public findAll(): Promise<LabInstance[]> {
    return this.repository.find(
      {
        order: {lastModifiedAt: 'DESC'},
      },
    );
  }

  public async getLabUsers(labInstanceId: string): Promise<ExternalLabUser[]> {
    const lab: LabInstance = await this.findByIdAndCheck(labInstanceId);

    return this.externalLabUserService.getUsers(lab);
  }

  public async addUserToLab(labInstanceId: string, newUser: ExternalNewLabUser): Promise<ExternalLabUser> {
    const lab: LabInstance = await this.findByIdAndCheck(labInstanceId);
    const user: User = await this.userService.findByIdAndCheck(newUser.userId);

    return this.externalLabUserService.addUser(lab, user, newUser.group);
  }

  public async updateName(labInstanceId: string, name: string): Promise<LabInstance> {
    const lab: LabInstance = await this.findByIdAndCheck(labInstanceId);
    lab.name = name;
    return this.repository.save(lab);
  }

  public async checkStatus(labInstanceId: string): Promise<any> {
    const lab: LabInstance = await this.findByIdAndCheck(labInstanceId);

    try {
      await this.externalLabApiService.healthCheck(lab);
    } catch {
      throw new BadRequestException('The lab is not running');
    }

    try {
      return await this.externalLabApiService.getSettings(lab);
    } catch {
      throw new BadRequestException('Can\'t retrieve la settings');
    }
  }
}
