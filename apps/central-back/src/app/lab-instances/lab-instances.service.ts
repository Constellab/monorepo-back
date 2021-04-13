import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {LabInstance} from './lab-instance.entity';
import {ObjectLiteral, Repository} from 'typeorm';
import {User} from '../users/user.entity';
import {RequestContextHelper} from '../core/modules/request-context/request-context.helper';
import {LabInstanceStatus} from './lab-instance-status.enum';
import {AbstractWithStatusService} from '../core/class/abstract-with-status.service';
import {LabInstanceStatusHistory} from './lab-instance-status-history.entity';
import {ExternalLabUserService} from '../external-lab-api/external-lab-user.service';
import {ExternalLabLoginResponse} from '../external-lab-api/external-lab-api.class';
import {LabInstanceToken} from './lab-instance-token.class';
import {ErrorText} from '../core/model/config/error-text.class';
import {Page} from '../core/model/config/page.class';

@Injectable()
export class LabInstancesService extends AbstractWithStatusService<LabInstance, LabInstanceStatus> {

  constructor(@InjectRepository(LabInstance) private repository: Repository<LabInstance>,
              @InjectRepository(LabInstanceStatusHistory) statusHistoRepo: Repository<LabInstanceStatusHistory>,
              private externalLabUserService: ExternalLabUserService) {
    super(repository, LabInstance, statusHistoRepo, LabInstanceStatusHistory);
  }


  async create(entity: LabInstance): Promise<LabInstance> {
    return super.createWithStatus(entity, LabInstanceStatus.STOPPED);
  }

  public getCurrentLabInstances(page: number, size: number): Promise<Page<LabInstance>> {
    const user: User = RequestContextHelper.getAndCheckCurrentUser();

    return this.findPaginated(page, size, {
      where: {owner: user.id},
      order: {lastModifiedAt: 'DESC'}
    });
  }

  public getCurrentRunningLabInstances(): Promise<LabInstance[]> {
    const user: User = RequestContextHelper.getAndCheckCurrentUser();

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
        await this.externalLabUserService.login(labInstance, RequestContextHelper.getAndCheckCurrentUser());

      return {
        labInstance: labInstance,
        token: 'Bearer ' + labAuth.access_token
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException(ErrorText.LAB_AUTH_ERROR);
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
}
