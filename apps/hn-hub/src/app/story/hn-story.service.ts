import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {Repository} from 'typeorm';
import {CmRichTextI} from '@monorepo/common-model';
import {HnTopic} from '../label/hn-topic.entity';
import {HnTopicService} from '../label/hn-topic.service';

@Injectable()
export class HnStoryService {

  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly labelService: HnTopicService,
  ){}

  async createStory(title: string, content: CmRichTextI, labels: HnTopic[] = []): Promise<HnStory> {
    const story = new HnStory();
    story.init(title, content, labels);
    return story;
  }

  async getStory(id: string): Promise<HnStory> {
    return this.storyRepository.findOneBy({id: id});
  }

  async getStories(): Promise<HnStory[]> {
    return this.storyRepository.find();
  }

  async getStoriesByLabel(label: HnTopic): Promise<HnStory[]> {
    return this.labelService.getLabel(label.id).then(label => label.stories);
  }
}
