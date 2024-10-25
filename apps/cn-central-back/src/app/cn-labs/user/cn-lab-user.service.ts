import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnLabUser, CnLabUserRole } from './cn-lab-user.entity';
import { EntityManager, Repository } from 'typeorm';
import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnUser } from '../../cn-users/cn-user.entity';
import { BlBadRequestException } from '@monorepo/back-core-lib';

@Injectable()
export class CnLabUserService {


  constructor(@InjectRepository(CnLabUser) private repository: Repository<CnLabUser>) {
  }

  public async createLabUser(lab: CnLab, user: CnUser,
                             role: CnLabUserRole, entityManager: EntityManager): Promise<CnLabUser> {
    const labGroupDb = await this.findByLabIdAndUserId(lab.id, user.id);

    if (labGroupDb != null) {
      throw new BlBadRequestException(CnErrorText.LAB_ALREADY_SHARED_WITH_USER);
    }


    const labGroup = new CnLabUser();
    labGroup.lab = lab as CnLabEntity;
    labGroup.user = user;
    labGroup.role = role;

    return entityManager.save(labGroup);
  }

  public async updateLabUserRole(lab: CnLab, userId: string,
                                 role: CnLabUserRole): Promise<CnLabUser> {

    const labGroup = await this.findByLabIdAndUserId(lab.id, userId);

    if (labGroup == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // if the role was changed from admin to user, check that there is at least one admin
    if (labGroup.role === CnLabUserRole.OWNER && role === CnLabUserRole.USER) {
      await this.checkLabAdminsCount(lab);
    }

    labGroup.role = role;
    return this.repository.save(labGroup);
  }

  public async deleteLabUser(lab: CnLab, userId: string, entityManager: EntityManager): Promise<void> {
    const labGroup = await this.findByLabIdAndUserId(lab.id, userId);

    if (labGroup == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // check that there is at least one admin
    if (labGroup.role === CnLabUserRole.OWNER) {
      await this.checkLabAdminsCount(lab);
    }

    await entityManager.remove(labGroup);
  }

  private async checkLabAdminsCount(lab: CnLab): Promise<void> {
    const labAdminsCount = await this.countLabAdmins(lab.id);
    if (labAdminsCount === 1) {
      throw new BlBadRequestException(CnErrorText.LAB_CANNOT_REMOVE_LAST_ADMIN, {detailArgs: {labName: lab.name}});
    }
  }

  private countLabAdmins(labId: string): Promise<number> {
    return this.repository.countBy({
      labId: labId,
      role: CnLabUserRole.OWNER
    });
  }


  public findByLabId(labId: string): Promise<CnLabUser[]> {
    return this.repository.find({
      where: {
        labId: labId
      },
      relations: { user: true }
    });
  }

  public async findByLabIdAndUserId(labId: string, userId: string): Promise<CnLabUser | null> {
    return this.repository.findOneBy({
      labId: labId,
      userId: userId
    });
  }

  public async findLabOwner(labId: string): Promise<CnLabUser[]> {
    return this.repository.find({
      where: {
        labId: labId,
        role: CnLabUserRole.OWNER
      },
      relations: { user: true }
    });
  }
}
