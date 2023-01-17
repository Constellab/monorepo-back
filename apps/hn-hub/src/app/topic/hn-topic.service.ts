import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnTopic} from './hn-topic.entity';
import {Repository} from 'typeorm';
import {HnTopicDto} from './hn-topic.dto';

@Injectable()
export class HnTopicService {
  constructor(@InjectRepository(HnTopic)
              private readonly topicRepository: Repository<HnTopic>) {
  }

  async checkToCreateTopic(topic: HnTopicDto): Promise<HnTopic> {
    if(topic.id){
      const t: HnTopic = await this.topicRepository.findOneBy({id: topic.id})
      if (t) return t;
    }
    const t: HnTopic = new HnTopic();
    t.name = topic.name;
    return this.topicRepository.save(t);
  }

  async getTopic(id: string): Promise<HnTopic> {
    return this.topicRepository.findOneBy({id: id});
  }
}
