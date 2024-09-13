import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnLabFolder, CnLabFolderEntity, CnLabFolderWithLab, CnLabFolderWithRootFolder } from './cn-lab-folder.entity';
import { EntityManager, Repository } from 'typeorm';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity
} from '../cn-folders-aggregate/cn_hierarchy_objects/cn-hierarchy-object.entity';


@Injectable()
export class CnLabFolderService {

  constructor(@InjectRepository(CnLabFolderEntity) private repository: Repository<CnLabFolderEntity>) {
  }


  public async createLabInstanceFolder(labInstance: CnLabInstance, rootFolder: CnHierarchyObject,
                                       entityManager: EntityManager): Promise<CnLabFolder> {
    if (!rootFolder.isRootFolder()) {
      throw new BlBadRequestException('Only root folder can be shared with a lab');
    }

    const labInstanceFolderDb = await this.findByLabInstanceIdAndRootFolderId(labInstance.id, rootFolder.id);

    if (labInstanceFolderDb) {
      throw new BlBadRequestException(CnErrorText.FOLDER_ALREADY_SHARED_WITH_LAB);
    }

    const labInstanceFolder = new CnLabFolderEntity();
    labInstanceFolder.labInstance = labInstance;
    labInstanceFolder.rootFolder = rootFolder as CnHierarchyObjectEntity;

    return entityManager.save(labInstanceFolder);
  }

  public async deleteLabInstanceFolder(labInstanceId: string, rootFolderId: string, entityManager: EntityManager): Promise<void> {
    const labInstanceFolder = await this.findByLabInstanceIdAndRootFolderId(labInstanceId, rootFolderId);

    if (labInstanceFolder == null) {
      throw new BlBadRequestException(CnErrorText.FOLDER_NOT_SHARED_WITH_LAB);
    }

    await entityManager.remove(labInstanceFolder);
  }


  public async findByLabInstanceIdAndRootFolderId(labInstanceId: string, rootFolderId: string): Promise<CnLabFolder> {
    return this.repository.findOneBy({ labInstanceId, rootFolderId: rootFolderId });
  }

  public async findByLabInstanceId(labInstanceId: string): Promise<CnLabFolderWithRootFolder[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId
      },
      relations: {
        rootFolder: true
      }
    });
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnLabFolderWithLab[]> {
    return this.repository.find({
      where: {
        rootFolderId: rootFolderId
      },
      relations: {
        labInstance: true
      }
    });
  }

  public async findByRootFolderIdAndLabInstanceId(rootFolderId: string, labInstanceId: string): Promise<CnLabFolder | null> {
    return this.repository.findOne(
      {
        where: { rootFolderId, labInstanceId }
      }
    );
  }
}
