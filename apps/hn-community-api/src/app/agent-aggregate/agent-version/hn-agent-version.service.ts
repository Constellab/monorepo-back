import { BlBadRequestException, BlNotFoundException } from '@monorepo/back-core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { HnTypingStyle } from '../../brick-aggregate/brick/hn-brick.dto';
import { HnAgentVersionFileInput } from '../agent/hn-agent.dto';
import { HnAgent } from '../agent/hn-agent.entity';
import { HnAgentVersion, HnAgentVersionState } from './hn-agent-version.entity';

@Injectable()
export class HnAgentVersionService {
  constructor(
    @InjectRepository(HnAgentVersion)
    private agentVersionRepository: Repository<HnAgentVersion>
  ) {}

  public async createFirstVersion(
    agent: HnAgent,
    versionFile: HnAgentVersionFileInput,
    entityManager: EntityManager
  ): Promise<HnAgentVersion> {
    const agentVersion = new HnAgentVersion();
    agentVersion.initVersion(agent, versionFile);
    return entityManager.save(agentVersion);
  }

  public async createNewDraftVersion(
    lastAgentVersion: HnAgentVersion,
    newAgentVersionFile: HnAgentVersionFileInput,
    entityManager: EntityManager,
    replace = false
  ): Promise<HnAgentVersion> {
    const agentVersion = new HnAgentVersion();
    agentVersion.initNewDraftVersion(lastAgentVersion, newAgentVersionFile, replace);
    return entityManager.save(agentVersion);
  }

  public async findOne(id: string): Promise<HnAgentVersion | null> {
    return this.agentVersionRepository.findOneBy({ id: id });
  }

  public async findByAgentIdAndVersionNumber(
    agentId: string,
    version: number
  ): Promise<HnAgentVersion | null> {
    return this.agentVersionRepository.findOneBy({
      agent: {
        id: agentId,
      },
      version: version,
    });
  }

  public async findByAgentAndVersionNumber(agent: HnAgent, version: number): Promise<HnAgentVersion | null> {
    return this.agentVersionRepository.findOneBy({
      agent: {
        id: agent.id,
      },
      version: version,
    });
  }

  public async findLatestByAgent(agent: HnAgent): Promise<HnAgentVersion | null> {
    return this.agentVersionRepository.findOne({
      where: {
        agent: {
          id: agent.id,
        },
      },
      order: {
        version: 'DESC',
      },
    });
  }

  public async findSecondLastByAgent(agent: HnAgent): Promise<HnAgentVersion | null> {
    const agentVersions = await this.agentVersionRepository.find({
      where: {
        agent: {
          id: agent.id,
        },
      },
      order: {
        version: 'DESC',
      },
    });
    if (agentVersions.length < 2) {
      return null;
    }
    return agentVersions[1];
  }

  public async findLatestPublishedByAgent(agent: HnAgent): Promise<HnAgentVersion | null> {
    return this.agentVersionRepository.findOneBy({
      agent: {
        id: agent.id,
      },
      version: agent.latestPublishVersion ?? undefined,
      versionState: HnAgentVersionState.PUBLISHED,
    });
  }

  public async findAll(): Promise<HnAgentVersion[]> {
    return this.agentVersionRepository.find();
  }

  public async findAllByAgentId(agentId: string): Promise<HnAgentVersion[]> {
    return this.agentVersionRepository.find({
      where: {
        agent: {
          id: agentId,
        },
      },
      order: {
        version: 'DESC',
      },
    });
  }

  public async findPublishedByAgentId(agentId: string): Promise<HnAgentVersion[]> {
    return this.agentVersionRepository.find({
      where: {
        agent: {
          id: agentId,
        },
        versionState: HnAgentVersionState.PUBLISHED,
      },
      order: {
        version: 'DESC',
      },
    });
  }

  public async updateParams(id: string, params: Record<string, any>): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionRepository.findOneBy({ id: id });
    if (!agentVersion) {
      throw new BlNotFoundException('Agent version not found');
    }
    agentVersion.params = params;
    return this.agentVersionRepository.save(agentVersion);
  }

  public async updateCode(id: string, code: string): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionRepository.findOneBy({ id: id });
    if (!agentVersion) {
      throw new BlNotFoundException('Agent version not found');
    }
    agentVersion.code = code;
    return this.agentVersionRepository.save(agentVersion);
  }

  public async updateEnvironment(id: string, environment: string): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionRepository.findOneBy({ id: id });
    if (!agentVersion) {
      throw new BlNotFoundException('Agent version not found');
    }
    agentVersion.environment = environment;
    return this.agentVersionRepository.save(agentVersion);
  }

  public async updateStyle(
    agentVersion: HnAgentVersion,
    style: HnTypingStyle,
    entityManager: EntityManager
  ): Promise<HnAgentVersion> {
    agentVersion.style = style;
    return entityManager.save(agentVersion);
  }

  public async publish(id: string, entityManager: EntityManager): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionRepository.findOneBy({ id: id });
    if (!agentVersion) {
      throw new BlNotFoundException('Agent version not found');
    }
    if (agentVersion.versionState === HnAgentVersionState.PUBLISHED) {
      throw new BlBadRequestException('Cannot publish the agent version is already published');
    }
    if (agentVersion.code == null || agentVersion.code.trim() === '') {
      throw new BlBadRequestException('Cannot publish an agent version without code');
    }
    agentVersion.versionState = HnAgentVersionState.PUBLISHED;
    return entityManager.save(agentVersion);
  }

  public async updateVersionInfos(agentVersionId: string, versionInfos: TeRichText): Promise<HnAgentVersion> {
    const agentVersion = await this.agentVersionRepository.findOneBy({ id: agentVersionId });
    if (!agentVersion) {
      throw new BlNotFoundException('Agent version not found');
    }
    agentVersion.setVersionInfoRichText(versionInfos);
    return this.agentVersionRepository.save(agentVersion);
  }

  public async deleteById(entityManager: EntityManager, id: string): Promise<void> {
    await entityManager.delete(HnAgentVersion, { id: id });
  }

  public async deleteByAgentId(entityManager: EntityManager, agentId: string): Promise<void> {
    await entityManager.delete(HnAgentVersion, { agent: { id: agentId } });
  }
}
