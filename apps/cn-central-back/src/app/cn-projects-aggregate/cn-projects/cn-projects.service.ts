import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CnProject, CnProjectWithFolder, CnProjectWithStorage } from './cn-project.entity';
import { BlAbstractService, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnUser } from '../../cn-users/cn-user.entity';

@Injectable()
export class CnProjectsService extends BlAbstractService<CnProject> {


  constructor(@InjectRepository(CnProject) public repository: Repository<CnProject>) {
    super(repository, CnProject);
  }

  public async findByIdAndCheckWithFolder(id: string): Promise<CnProjectWithFolder> {
    return super.findByIdAndCheck(id, { folderHierarchy: true });
  }

  public async findByIfAndCheckWithStorage(id: string): Promise<CnProjectWithStorage> {
    return super.findByIdAndCheck(id, { mainStorage: true, backupStorage: true });
  }

  public async findByIdAndCheckWithDescription(id: string): Promise<CnProject> {
    return await this.repository.findOne({
      select: {
        id: true,
        description: true as any
      },
      where: { id: id }
    });
  }

  public async getProjectDescription(id: string): Promise<BlRichTextContent> {
    const project = await this.findByIdAndCheckWithDescription(id);
    return project.description;
  }

  public async updateDescription(id: string, description: BlRichTextContent): Promise<void> {
    await this.updatePartial(id, { description: description });
  }

  public async updateLeader(id: string, leader: CnUser, entityManager: EntityManager): Promise<void> {
    await this.updatePartial(id, { leader: leader }, entityManager);
  }
}
