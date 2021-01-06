import {Injectable} from '@nestjs/common';
import {Repository} from 'typeorm';
import {AbstractService} from '../core/class/abstract.service';
import {ServerInfo} from './server-info.entity';
import {InjectRepository} from '@nestjs/typeorm';

@Injectable()
export class ServersInfoService extends AbstractService<ServerInfo> {

  constructor(@InjectRepository(ServerInfo) private repository: Repository<ServerInfo>) {
    super(repository, ServerInfo);
  }

  findAll(): Promise<ServerInfo[]> {
    return this.repository.find({
      order: {name: 'ASC'}
    });
  }

}
