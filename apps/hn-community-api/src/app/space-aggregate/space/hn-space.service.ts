import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnSpace } from './hn-space.entity';

@Injectable()
export class HnSpaceService {
  constructor(
    @InjectRepository(HnSpace)
    private spaceRepository: Repository<HnSpace>,
    private coreConfigService: HnCoreConfigService
  ) {}

  public async find(): Promise<HnSpace[]> {
    return this.spaceRepository.find();
  }

  public async findOne(id: string): Promise<HnSpace> {
    return this.spaceRepository.findOneBy({ id: id });
  }

  public async create(space: HnSpace): Promise<HnSpace> {
    return this.spaceRepository.save(space);
  }

  public async update(space: HnSpace): Promise<HnSpace> {
    return this.spaceRepository.save(space);
  }

  public async delete(id: string): Promise<void> {
    await this.spaceRepository.delete(id);
  }

  public async getGencoverySpace(): Promise<HnSpace> {
    return this.spaceRepository.findOneBy({ id: this.coreConfigService.getGencoverySpaceId() });
  }
}
