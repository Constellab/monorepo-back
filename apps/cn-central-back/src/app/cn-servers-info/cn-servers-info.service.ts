import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnServerInfo} from './cn-server-info.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class CnServersInfoService extends CnAbstractService<CnServerInfo> {

  constructor(@InjectRepository(CnServerInfo) private repository: Repository<CnServerInfo>) {
    super(repository, CnServerInfo);
  }

  findAll(): Promise<CnServerInfo[]> {
    return this.repository.find({
      order: {name: 'ASC'}
    });
  }

}
