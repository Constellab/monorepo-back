import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Group} from './group.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class GroupsService extends AbstractService<Group> {

  constructor(@InjectRepository(Group) private repository: Repository<Group>) {
    super(repository, Group);
  }
}
