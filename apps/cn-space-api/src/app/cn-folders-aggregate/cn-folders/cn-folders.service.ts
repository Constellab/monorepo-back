import { BlAbstractService, BlNotFoundException } from '@monorepo/back-core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CnFolder, CnFolderEntity, CnFolderWithHierarchy, CnFolderWithStorage } from './cn-folder.entity';

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
    const folder = await this.repository.findOne({
      select: {
        id: true,
        description: true,
      },
      where: { id: id },
    });
    if (folder == null) {
      throw new BlNotFoundException(`Object '${CnFolderEntity.name}' with id ${id} not found`);
    }
    return folder;
  }

  public async getDescription(id: string): Promise<TeRichText> {
    const folder = await this.findByIdAndCheckWithDescription(id);
    return new TeRichText(folder.description ?? null);
  }

  public async updateDescription(id: string, description: TeRichText): Promise<void> {
    await this.updatePartial(id, { description: description.toJson() });
  }

  public async findChildrenFolders(parentId: string): Promise<CnFolder[]> {
    return await this.repository.find({
      where: { hierarchyRepresentation: { parentId: parentId } },
    });
  }
}
