import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnLabInstanceUser, CnLabInstanceUserRole} from './cn-lab-instance-user.entity';
import {EntityManager, Repository} from 'typeorm';
import {CnErrorText} from '../../cn-core/model/config/cn-error-text.class';
import {CnLabInstance} from '../cn-lab-instance.entity';
import {CnUser} from '../../cn-users/cn-user.entity';
import {BlBadRequestException} from '@monorepo/back-core-lib';

@Injectable()
export class CnLabInstanceUserService {


  constructor(@InjectRepository(CnLabInstanceUser) private repository: Repository<CnLabInstanceUser>) {
  }

  public async createLabInstanceUser(labInstance: CnLabInstance, user: CnUser,
                                     role: CnLabInstanceUserRole, entityManager: EntityManager): Promise<CnLabInstanceUser> {
    const labInstanceGroupDb = await this.findByLabInstanceIdAndUserId(labInstance.id, user.id);

    if (labInstanceGroupDb != null) {
      throw new BlBadRequestException(CnErrorText.LAB_ALREADY_SHARED_WITH_USER);
    }


    const labInstanceGroup = new CnLabInstanceUser();
    labInstanceGroup.labInstance = labInstance;
    labInstanceGroup.user = user;
    labInstanceGroup.role = role;

    return entityManager.save(labInstanceGroup);
  }

  public async updateLabInstanceUserRole(labInstanceId: string, userId: string,
                                         role: CnLabInstanceUserRole): Promise<CnLabInstanceUser> {

    const labInstanceGroup = await this.findByLabInstanceIdAndUserId(labInstanceId, userId);

    if (labInstanceGroup == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // if the role was changed from admin to user, check that there is at least one admin
    if (labInstanceGroup.role === CnLabInstanceUserRole.OWNER && role === CnLabInstanceUserRole.USER) {
      await this.checkLabAdminsCount(labInstanceId);
    }

    labInstanceGroup.role = role;
    return this.repository.save(labInstanceGroup);
  }

  public async deleteLabInstanceUser(labInstanceId: string, userId: string, entityManager: EntityManager): Promise<void> {
    const labInstanceGroup = await this.findByLabInstanceIdAndUserId(labInstanceId, userId);

    if (labInstanceGroup == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // check that there is at least one admin
    if (labInstanceGroup.role === CnLabInstanceUserRole.OWNER) {
      await this.checkLabAdminsCount(labInstanceId);
    }

    await entityManager.remove(labInstanceGroup);
  }

  private async checkLabAdminsCount(labInstanceId: string): Promise<void> {
    const labAdminsCount = await this.countLabAdmins(labInstanceId);
    if (labAdminsCount === 1) {
      throw new BlBadRequestException(CnErrorText.LAB_CANNOT_REMOVE_LAST_ADMIN);
    }
  }

  private countLabAdmins(labInstanceId: string): Promise<number> {
    return this.repository.countBy({
      labInstanceId: labInstanceId,
      role: CnLabInstanceUserRole.OWNER
    });
  }


  public findByLabInstanceId(labInstanceId: string): Promise<CnLabInstanceUser[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId
      },
      relations: {user: true}
    });
  }

  public async findByLabInstanceIdAndUserId(labInstanceId: string, userId: string): Promise<CnLabInstanceUser | null> {
    return this.repository.findOneBy({
      labInstanceId: labInstanceId,
      userId: userId
    });
  }

  public async findLabOwner(labInstanceId: string): Promise<CnLabInstanceUser[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId,
        role: CnLabInstanceUserRole.OWNER
      },
      relations: {user: true}
    });
  }
}
