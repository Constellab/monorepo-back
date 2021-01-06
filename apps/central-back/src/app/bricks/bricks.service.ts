import {Injectable} from '@nestjs/common';
import {AbstractService} from '../core/class/abstract.service';
import {Brick} from './brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class BricksService extends AbstractService<Brick> {

  constructor(@InjectRepository(Brick) private repository: Repository<Brick>) {
    super(repository, Brick);
  }

}
