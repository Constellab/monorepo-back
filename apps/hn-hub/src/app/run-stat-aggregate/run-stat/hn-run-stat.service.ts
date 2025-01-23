import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HnRunStat } from './hn-run-stat.entity';

@Injectable()
export class HnRunStatService {
  constructor(
    @InjectRepository(HnRunStat)
    private runStatRepository: Repository<HnRunStat>
  ) {}

  async findAll(): Promise<HnRunStat[]> {
    return this.runStatRepository.find();
  }

  async save(entityManager: EntityManager, runStat: HnRunStat): Promise<HnRunStat> {
    return entityManager.save(runStat);
  }
}
