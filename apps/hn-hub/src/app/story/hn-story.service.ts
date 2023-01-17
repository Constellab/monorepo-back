import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {Repository} from 'typeorm';
import {HnTopicService} from '../topic/hn-topic.service';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService} from '@monorepo/back-core-lib';
import {CmRichText} from '@monorepo/common-model';

@Injectable()
export class HnStoryService {

  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly topicService: HnTopicService,
  ) {
  }

  async createStory(title: string): Promise<HnStory> {
    const story = new HnStory();
    story.title = title;
    story.content = CmRichText.newRichText();
    return this.storyRepository.save(story);
  }

  async getStory(id: string): Promise<HnStory> {
    return this.storyRepository.findOneBy({id: id});
  }

  async getStories(page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
  }

  async getStoriesByTopicId(topicId: string, page: number, size: number): Promise<ClPage<HnStory>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        topics: {
          id: topicId
        }
      },
      order: {createdAt: 'DESC' as any}
    }, this.storyRepository.manager, HnStory);
  }
}
