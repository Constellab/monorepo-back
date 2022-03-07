import {Injectable} from '@nestjs/common';
import {CnGroup} from './cn-group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class CnGroupsService extends BlAbstractService<CnGroup> {

  constructor(@InjectRepository(CnGroup) private repository: Repository<CnGroup>) {
    super(repository, CnGroup);
  }
}
