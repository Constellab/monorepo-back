import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnLabStatusRule, CnLabStatusRuleAction, CnLabStatusRuleType} from './cn-lab-status-rule.entity';
import {BlAbstractService} from '@monorepo/back-core-lib';


@Injectable()
export class CnLabStatusRuleService extends BlAbstractService<CnLabStatusRule>{

  constructor(@InjectRepository(CnLabStatusRule) private repository: Repository<CnLabStatusRule>) {
    super(repository, CnLabStatusRule);
  }


  async create(entity: CnLabStatusRule, entityManager?: EntityManager): Promise<CnLabStatusRule> {
    this.checkBeforeSave(entity);
    return super.create(entity, entityManager);
  }

  async update(entity: CnLabStatusRule, entityManager?: EntityManager): Promise<CnLabStatusRule> {
    this.checkBeforeSave(entity);
    return super.update(entity, entityManager);
  }

  private checkBeforeSave(rule: CnLabStatusRule): void {
    if(rule.type === CnLabStatusRuleType.STOP_AFTER_EXPERIMENT || rule.type === CnLabStatusRuleType.STOP_AFTER_BACKUP) {
      rule.isPersistent = false;
    }
  }

  public async findRulesByActionAndType(action: CnLabStatusRuleAction, type: CnLabStatusRuleType): Promise<CnLabStatusRule[]> {
    return this.repository.find({
      where: {action, type},
      relations: {labInstance: true}
    });
  }
}
