import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class CnGroupsService extends CnAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>) {
    super(repository, CnGroup);
  }
}
