import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnStoryFile} from './hn-story-file.entity';

@Injectable()
export class HnStoryFileService {
  constructor(@InjectRepository(HnStoryFile)
              private readonly storyAuthorRepository: Repository<HnStoryFile>,
  ) {
  }

  async saveStoryFile(storyFile: HnStoryFile): Promise<HnStoryFile> {
    return this.storyAuthorRepository.save(storyFile);
  }

  async deleteStoryFile(storyFile: HnStoryFile): Promise<void> {
    await this.storyAuthorRepository.delete(storyFile.id);
  }

  async getStoryFile(id: string): Promise<HnStoryFile> {
    return this.storyAuthorRepository.findOneBy({id});
  }

}
