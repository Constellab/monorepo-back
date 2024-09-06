import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnLabProject } from './cn-lab-project.entity';
import { EntityManager, Repository } from 'typeorm';
import { CnLabInstance } from '../cn-lab-instances/cn-lab-instance.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { BlBadRequestException } from '@monorepo/back-core-lib';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity
} from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';


@Injectable()
export class CnLabProjectService {

  constructor(@InjectRepository(CnLabProject) private repository: Repository<CnLabProject>) {
  }


  public async createLabInstanceFolder(labInstance: CnLabInstance, rootFolder: CnFolderHierarchy,
                                       entityManager: EntityManager): Promise<CnLabProject> {
    if (!rootFolder.isRootFolder()) {
      throw new BlBadRequestException('Only root folder can be shared with a lab');
    }

    const labInstanceFolderDb = await this.findByLabInstanceIdAndRootFolderId(labInstance.id, rootFolder.id);

    if (labInstanceFolderDb) {
      throw new BlBadRequestException(CnErrorText.PROJECT_ALREADY_SHARED_WITH_LAB);
    }

    const labInstanceFolder = new CnLabProject();
    labInstanceFolder.labInstance = labInstance;
    labInstanceFolder.rootFolder = rootFolder as CnFolderHierarchyEntity;

    return entityManager.save(labInstanceFolder);
  }

  public async deleteLabInstanceFolder(labInstanceId: string, rootFolderId: string, entityManager: EntityManager): Promise<void> {
    const labInstanceFolder = await this.findByLabInstanceIdAndRootFolderId(labInstanceId, rootFolderId);

    if (labInstanceFolder == null) {
      throw new BlBadRequestException(CnErrorText.PROJECT_NOT_SHARED_WITH_LAB);
    }

    await entityManager.remove(labInstanceFolder);
  }


  public async findByLabInstanceIdAndRootFolderId(labInstanceId: string, rootFolderId: string): Promise<CnLabProject> {
    return this.repository.findOneBy({ labInstanceId, rootFolderId: rootFolderId });
  }

  // TODO créer un sous type
  public async findByLabInstanceId(labInstanceId: string): Promise<CnLabProject[]> {
    return this.repository.find({
      where: {
        labInstanceId: labInstanceId
      },
      relations: {
        rootFolder: true
      }
    });
  }

  public async findByRootFolderId(rootFolderId: string): Promise<CnLabProject[]> {
    return this.repository.find({
      where: {
        rootFolderId: rootFolderId
      },
      relations: {
        labInstance: true
      }
    });
  }

  public async findByRootFolderIdAndLabInstanceId(rootFolderId: string, labInstanceId: string): Promise<CnLabProject | null> {
    return this.repository.findOne(
      {
        where: { rootFolderId, labInstanceId }
      }
    );
  }
}
