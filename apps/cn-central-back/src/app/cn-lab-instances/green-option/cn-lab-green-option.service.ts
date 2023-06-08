import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnLabGreenOption, CnLabGreenOptionType} from './cn-lab-green-option.entity';
import {BlAbstractService, BlBadRequestException} from '@monorepo/back-core-lib';
import {CnLabGreenOptionFormDto} from './cn-lab-green-option.dto';
import {CnLabInstance} from '../cn-lab-instance.entity';


@Injectable()
export class CnLabGreenOptionService extends BlAbstractService<CnLabGreenOption> {

  constructor(@InjectRepository(CnLabGreenOption) private repository: Repository<CnLabGreenOption>) {
    super(repository, CnLabGreenOption);
  }

  async createFromDTO(dto: CnLabGreenOptionFormDto, labInstance: CnLabInstance): Promise<CnLabGreenOption> {
    if(labInstance.isDesktop()){
      throw new BlBadRequestException('Desktop lab instance cannot have green computing options')
    }
    const entity = this.checkBeforeSave(dto);
    entity.labInstance = labInstance;
    return this.create(entity);
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
    if (entity.type === CnLabGreenOptionType.STOP_AFTER_EXPERIMENT ||
      entity.type === CnLabGreenOptionType.STOP_AFTER_BACKUP) {
      entity.isPersistent = false;
    }

    return entity;
  }

  public async findRulesByType(type: CnLabGreenOptionType): Promise<CnLabGreenOption[]> {
    return this.repository.find({
      where: {type: type},
    });
  }

  public async findRulesByLabInstanceId(labInstanceId: string): Promise<CnLabGreenOption[]> {
    return this.repository.find({
      where: {labInstance: {id: labInstanceId}},
    });
  }
}
