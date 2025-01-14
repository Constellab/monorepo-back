import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnRunStat } from './hn-run-stat.entity';
import { HnRunStatFromLabDto } from './hn-run-stat.dto';
import { HnUser } from '../../users/hn-user.entity';
import { HnAgentVersion } from '../../agent-aggregate/agent-version/hn-agent-version.entity';

@Injectable()
export class HnRunStatService {
  constructor(
    @InjectRepository(HnRunStat)
    private runStatRepository: Repository<HnRunStat>
  ) {}

  async initRunStat(
    stat: HnRunStatFromLabDto,
    user: HnUser,
    agentVersion?: HnAgentVersion
  ): Promise<HnRunStat> {
    const runStat = new HnRunStat();
    runStat.init(stat, user, agentVersion);
    return this.runStatRepository.save(runStat);
  }
}
