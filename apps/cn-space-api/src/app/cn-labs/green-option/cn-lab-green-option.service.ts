import { BlAbstractService, BlBadRequestException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnLab, CnLabEntity } from '../cn-lab.entity';
import { CnLabGreenOptionFormDto } from './cn-lab-green-option.dto';
import { CnLabGreenOption, CnLabGreenOptionType } from './cn-lab-green-option.entity';

@Injectable()
export class CnLabGreenOptionService extends BlAbstractService<CnLabGreenOption> {
  constructor(@InjectRepository(CnLabGreenOption) private repository: Repository<CnLabGreenOption>) {
    super(repository, CnLabGreenOption);
  }

  async createFromDTO(
    dto: CnLabGreenOptionFormDto,
    lab: CnLab,
    entityManager?: EntityManager
  ): Promise<CnLabGreenOption> {
    if (lab.isDesktop()) {
      throw new BlBadRequestException('Desktop lab cannot have green computing options');
    }
    const entity = this.checkBeforeSave(dto);
    entity.lab = lab as CnLabEntity;
    return this.create(entity, entityManager);
  }

  public async createStopAfterBackup(lab: CnLab, entityManager?: EntityManager): Promise<CnLabGreenOption> {
    const existingRule = await this.findByLabIdAndType(lab.id, CnLabGreenOptionType.STOP_AFTER_BACKUP);
    if (existingRule) {
      return existingRule;
    }
    const entity = new CnLabGreenOption();
    entity.lab = lab as CnLabEntity;
    entity.type = CnLabGreenOptionType.STOP_AFTER_BACKUP;
    entity.isPersistent = false;
    entity.value = {};
    return this.create(entity, entityManager);
  }

  async updateFromDTO(id: string, dto: CnLabGreenOptionFormDto): Promise<CnLabGreenOption> {
    const entity = this.checkBeforeSave(dto);
    entity.id = id;
    return this.update(entity);
  }

  private checkBeforeSave(dto: CnLabGreenOptionFormDto): CnLabGreenOption {
    const entity = new CnLabGreenOption();
    entity.type = dto.type;
    entity.value = dto.value;
    entity.isPersistent = dto.isPersistent;
    if (
      entity.type === CnLabGreenOptionType.STOP_AFTER_SCENARIO ||
      entity.type === CnLabGreenOptionType.STOP_AFTER_BACKUP
    ) {
      entity.isPersistent = false;
    }

    return entity;
  }

  public async deleteNonPersistentRulesByLabId(labId: string): Promise<void> {
    await this.repository.delete({ labId: labId, isPersistent: false });
  }

  public async findRulesByType(type: CnLabGreenOptionType): Promise<CnLabGreenOption[]> {
    return this.repository.find({
      where: { type: type },
    });
  }

  public async findRulesByLabId(labId: string): Promise<CnLabGreenOption[]> {
    return this.repository.find({
      where: { lab: { id: labId } },
    });
  }

  public findByLabIdAndType(labId: string, type: CnLabGreenOptionType): Promise<CnLabGreenOption> {
    return this.repository.findOne({
      where: { labId, type },
    });
  }
}
