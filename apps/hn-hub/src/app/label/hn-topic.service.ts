import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnTopic} from './hn-topic.entity';
import {Repository} from 'typeorm';

@Injectable()
export class HnTopicService {
  constructor(@InjectRepository(HnTopic)
              private readonly storyLabelRepository: Repository<HnTopic>) {
  }

  async getOrCreateLabel(label: HnTopic): Promise<HnTopic> {
    const l: HnTopic =  await this.storyLabelRepository.findOneBy({id: label.id});
    if(l) {
      return l;
    }
    return this.storyLabelRepository.save(label);
  }

  async getLabel(id: string): Promise<HnTopic> {
    return this.storyLabelRepository.findOneBy({id: id});
  }
}
