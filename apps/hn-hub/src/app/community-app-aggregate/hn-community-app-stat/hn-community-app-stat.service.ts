import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HnCommunityAppStat } from './hn-community-app-stat.entity';
import { EntityManager, Repository } from 'typeorm';
import { HnUser } from '../../users/hn-user.entity';
import { HnCommunityAppStatLabDto } from './hn-community-app-stat.dto';

@Injectable()
export class HnCommunityAppStatService {
  constructor(
    @InjectRepository(HnCommunityAppStat)
    private readonly communityAppStatRepository: Repository<HnCommunityAppStat>
  ) {}

  async create(
    creator: HnUser,
    labStatDto: HnCommunityAppStatLabDto,
    entityManager: EntityManager
  ): Promise<HnCommunityAppStat> {
    const stat = new HnCommunityAppStat();
    stat.appUrl = labStatDto.app_url;
    stat.creator = creator;
    return entityManager.save(stat);
  }
}
