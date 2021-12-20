import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnBrick} from './cn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

@Injectable()
export class CnBricksService extends CnAbstractService<CnBrick> {

  constructor(@InjectRepository(CnBrick) private repository: Repository<CnBrick>) {
    super(repository, CnBrick);
  }

}
