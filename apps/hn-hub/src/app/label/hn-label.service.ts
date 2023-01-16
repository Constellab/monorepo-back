import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnLabel} from './hn-label.entity';
import {Repository} from 'typeorm';

@Injectable()
export class HnLabelService {
  constructor(@InjectRepository(HnLabel)
              private readonly storyLabelRepository: Repository<HnLabel>) {
  }

  async getOrCreateLabel(label: HnLabel): Promise<HnLabel> {
    const l: HnLabel =  await this.storyLabelRepository.findOneBy({id: label.id});
    if(l) {
      return l;
    }
    return this.storyLabelRepository.save(label);
  }

  async getLabel(id: string): Promise<HnLabel> {
    return this.storyLabelRepository.findOneBy({id: id});
  }
}
