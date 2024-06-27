import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnStoryFile} from './hn-story-file.entity';

@Injectable()
export class HnStoryFileService {
  constructor(@InjectRepository(HnStoryFile)
              private readonly storyAuthorRepository: Repository<HnStoryFile>,
  ) {
  }

  async getStoryFilesByStoryId(storyId: string): Promise<HnStoryFile[]> {
    return this.storyAuthorRepository.find({where: {story: {id: storyId}}});
  }

  async saveStoryFile(storyFile: HnStoryFile): Promise<HnStoryFile> {
    return this.storyAuthorRepository.save(storyFile);
  }

  async deleteStoryFile(storyFile: HnStoryFile): Promise<void> {
    await this.storyAuthorRepository.delete(storyFile.id);
  }

  async deleteStoryFileWithEntityManager(storyFileId: string, entityManager: EntityManager): Promise<void>{
    await entityManager.delete(HnStoryFile, storyFileId);
  }

  async getStoryFile(id: string): Promise<HnStoryFile> {
    return this.storyAuthorRepository.findOneBy({id});
  }

  async getStoryFileByFileName(fileName: string): Promise<HnStoryFile> {
    return this.storyAuthorRepository.findOneBy({fileName: fileName});
  }

}
