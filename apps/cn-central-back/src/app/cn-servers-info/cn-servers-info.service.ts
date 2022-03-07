import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {CnServerInfo} from './cn-server-info.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class CnServersInfoService extends BlAbstractService<CnServerInfo> {

  constructor(@InjectRepository(CnServerInfo) private repository: Repository<CnServerInfo>) {
    super(repository, CnServerInfo);
  }

  findAll(): Promise<CnServerInfo[]> {
    return this.repository.find({
      order: {name: 'ASC'}
    });
  }

}
