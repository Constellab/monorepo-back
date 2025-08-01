import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnErrorText } from '../../cn-core/model/config/cn-error-text.class';
import { CnUser } from '../../cn-users/cn-user.entity';
import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnLabStatus } from '../status/cn-lab-status.enum';
import { CnLabUser, CnLabUserEntity, CnLabUserRole, CnLabUserWithUser } from './cn-lab-user.entity';

@Injectable()
export class CnLabUserService {
  constructor(@InjectRepository(CnLabUserEntity) private repository: Repository<CnLabUserEntity>) {}

  public async createLabUser(
    lab: CnLab,
    user: CnUser,
    role: CnLabUserRole,
    entityManager: EntityManager
  ): Promise<CnLabUserEntity> {
    const labUserDb = await this.findByLabIdAndUserId(lab.id, user.id);

    if (labUserDb != null) {
      throw new BlBadRequestException(CnErrorText.LAB_ALREADY_SHARED_WITH_USER);
    }

    const labUser = new CnLabUserEntity();
    labUser.lab = lab as CnLabEntity;
    labUser.user = user;
    labUser.role = role;

    return entityManager.save(labUser);
  }

  public async updateLabUserRole(lab: CnLab, userId: string, role: CnLabUserRole): Promise<CnLabUserEntity> {
    const labUser = await this.findByLabIdAndUserId(lab.id, userId);

    if (labUser == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // if the role was changed from admin to user, check that there is at least one admin
    if (
      lab.currentStatus.status !== CnLabStatus.NO_SERVER &&
      labUser.role === CnLabUserRole.OWNER &&
      role !== CnLabUserRole.OWNER
    ) {
      await this.checkLabAdminsCount(lab);
    }

    labUser.role = role;
    return this.repository.save(labUser);
  }

  public async deleteLabUser(lab: CnLab, userId: string, entityManager: EntityManager): Promise<void> {
    const labUser = await this.findByLabIdAndUserId(lab.id, userId);
    if (labUser == null) {
      throw new BlBadRequestException(CnErrorText.LAB_NOT_SHARED_WITH_USER);
    }

    // check that there is at least one admin
    // if the lab exists (status is not NO_SERVER)
    if (lab.currentStatus.status !== CnLabStatus.NO_SERVER && labUser.role === CnLabUserRole.OWNER) {
      await this.checkLabAdminsCount(lab);
    }

    await entityManager.remove(labUser);
  }

  private async checkLabAdminsCount(lab: CnLab): Promise<void> {
    const labAdminsCount = await this.countLabAdmins(lab.id);
    if (labAdminsCount === 1) {
      throw new BlBadRequestException(CnErrorText.LAB_CANNOT_REMOVE_LAST_ADMIN, {
        detailArgs: { labName: lab.name },
      });
    }
  }

  private countLabAdmins(labId: string): Promise<number> {
    return this.repository.countBy({
      labId: labId,
      role: CnLabUserRole.OWNER,
    });
  }

  public findByLabId(labId: string): Promise<CnLabUserWithUser[]> {
    return this.repository.find({
      where: {
        labId: labId,
      },
      relations: { user: true },
    });
  }

  public async findByLabIdAndUserId(labId: string, userId: string): Promise<CnLabUser | null> {
    return this.repository.findOneBy({
      labId: labId,
      userId: userId,
    });
  }

  public async findLabOwner(labId: string): Promise<CnLabUserWithUser[]> {
    return this.repository.find({
      where: {
        labId: labId,
        role: CnLabUserRole.OWNER,
      },
      relations: { user: true },
    });
  }
}
