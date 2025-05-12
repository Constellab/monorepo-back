import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnFolder, CnFolderEntity, CnFolderWithHierarchy, CnFolderWithStorage } from './cn-folder.entity';
import { BlAbstractService } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class CnFoldersService extends BlAbstractService<CnFolderEntity> {
  constructor(@InjectRepository(CnFolderEntity) public repository: Repository<CnFolderEntity>) {
    super(repository, CnFolderEntity);
  }

  public async findByIdAndCheckWithFolder(id: string): Promise<CnFolderWithHierarchy> {
    return super.findByIdAndCheck(id, { hierarchyRepresentation: true });
  }

  public async findByIfAndCheckWithStorage(rootFolderId: string): Promise<CnFolderWithStorage> {
    return super.findByIdAndCheck(rootFolderId, { mainStorage: true, backupStorage: true });
  }

  private async findByIdAndCheckWithDescription(id: string): Promise<CnFolderEntity> {
    return await this.repository.findOne({
      select: {
        id: true,
        description: true as any,
      },
      where: { id: id },
    });
  }

  public async getDescription(id: string): Promise<TeRichText> {
    const folder = await this.findByIdAndCheckWithDescription(id);
    return new TeRichText(folder.description);
  }

  public async updateDescription(id: string, description: TeRichText): Promise<void> {
    await this.updatePartial(id, { description: description.toJson() });
  }

  public async updateLeader(id: string, leader: CnUser, entityManager: EntityManager): Promise<void> {
    await this.updatePartial(id, { leader: leader }, entityManager);
  }

  public async findChildrenFolders(parentId: string): Promise<CnFolder[]> {
    return await this.repository.find({
      where: { hierarchyRepresentation: { parentId: parentId } },
    });
  }
}
