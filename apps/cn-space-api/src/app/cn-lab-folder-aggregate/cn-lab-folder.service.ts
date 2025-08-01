import { BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-folders-aggregate/cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnLab, CnLabEntity } from '../cn-labs/cn-lab.entity';
import {
  CnLabFolder,
  CnLabFolderEntity,
  CnLabFolderWithLab,
  CnLabFolderWithRootFolder,
} from './cn-lab-folder.entity';

@Injectable()
export class CnLabFolderService {
  constructor(@InjectRepository(CnLabFolderEntity) private repository: Repository<CnLabFolderEntity>) {}

  public async createLabFolder(
    lab: CnLab,
    rootFolder: CnHierarchyObject,
    entityManager: EntityManager
  ): Promise<CnLabFolder> {
    if (!rootFolder.isRootFolder()) {
      throw new BlBadRequestException('Only root folder can be shared with a lab');
    }

    const labFolderDb = await this.findByLabIdAndRootFolderId(lab.id, rootFolder.id);

    if (labFolderDb) {
      throw new BlBadRequestException(CnErrorText.FOLDER_ALREADY_SHARED_WITH_LAB);
    }

    const labFolder = new CnLabFolderEntity();
    labFolder.lab = lab as CnLabEntity;
    labFolder.rootFolder = rootFolder as CnHierarchyObjectEntity;

    return entityManager.save(labFolder);
  }

  public async deleteLabFolder(
    labId: string,
    rootFolderId: string,
    entityManager: EntityManager
  ): Promise<void> {
    const labFolder = await this.findByLabIdAndRootFolderId(labId, rootFolderId);

    if (labFolder == null) {
      throw new BlBadRequestException(CnErrorText.FOLDER_NOT_SHARED_WITH_LAB);
    }

    await entityManager.remove(labFolder);
  }

  public async findByLabIdAndRootFolderId(labId: string, rootFolderId: string): Promise<CnLabFolder> {
    return this.repository.findOneBy({ labId, rootFolderId: rootFolderId });
  }

  public async findByLabId(labId: string): Promise<CnLabFolderWithRootFolder[]> {
    return this.repository.find({
      where: {
        labId: labId,
      },
      relations: {
        rootFolder: true,
      },
    });
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnLabFolderWithLab[]> {
    return this.repository.find({
      where: {
        rootFolderId: rootFolderId,
      },
      relations: {
        lab: true,
      },
    });
  }

  public async findByRootFolderIds(rootFolderIds: string[]): Promise<CnLabFolderWithLab[]> {
    return this.repository.find({
      where: {
        rootFolderId: In(rootFolderIds),
      },
      relations: {
        lab: true,
      },
    });
  }

  public async findByRootFolderIdAndLabId(rootFolderId: string, labId: string): Promise<CnLabFolder | null> {
    return this.repository.findOne({
      where: { rootFolderId, labId },
    });
  }
}
