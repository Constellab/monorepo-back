import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HnAgentVersionBrickDependencies } from './hn-agent-version-brick-dependencies.entity';
import { HnAgentVersion } from '../agent-version/hn-agent-version.entity';
import { HnBrickVersion } from '../../brick-aggregate/brick-version/hn-brick-version.entity';

@Injectable()
export class HnAgentVersionBrickDependenciesService {
  constructor(
    @InjectRepository(HnAgentVersionBrickDependencies)
    private agentVersionBrickDependenciesRepository: Repository<HnAgentVersionBrickDependencies>
  ) {}

  public async create(
    agentVersion: HnAgentVersion,
    brickVersion: HnBrickVersion,
    entityManager: EntityManager
  ): Promise<HnAgentVersionBrickDependencies> {
    const agentVersionBrickDependencies = new HnAgentVersionBrickDependencies();
    agentVersionBrickDependencies.init(agentVersion, brickVersion);
    return entityManager.save(agentVersionBrickDependencies);
  }

  public async getBrickVersionDependencies(
    agentVersionId: string
  ): Promise<HnAgentVersionBrickDependencies[]> {
    return this.agentVersionBrickDependenciesRepository.findBy({
      agentVersionId: agentVersionId,
    });
  }

  public async deleteByAgentVersionId(entityManager: EntityManager, agentVersionId: string): Promise<void> {
    await entityManager.delete(HnAgentVersionBrickDependencies, { agentVersionId: agentVersionId });
  }
}
