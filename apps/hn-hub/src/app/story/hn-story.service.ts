import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnStory} from './hn-story.entity';
import {Repository} from 'typeorm';
import {CmRichTextI} from '@monorepo/common-model';
import {HnLabel} from '../label/hn-label.entity';
import {HnLabelService} from '../label/hn-label.service';

@Injectable()
export class HnStoryService {

  constructor(@InjectRepository(HnStory)
              private readonly storyRepository: Repository<HnStory>,
              private readonly labelService: HnLabelService,
  ){}

  async createStory(title: string, content: CmRichTextI, labels: HnLabel[] = []): Promise<HnStory> {
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

  async getStoriesByLabel(label: HnLabel): Promise<HnStory[]> {
    return this.labelService.getLabel(label.id).then(label => label.stories);
  }
}
