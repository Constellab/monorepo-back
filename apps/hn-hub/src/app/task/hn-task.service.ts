import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnTask} from './hn-task.entity';

@Injectable()
export class HnTaskService {
  constructor(
    @InjectRepository(HnTask)
    private readonly resourceRepository: Repository<HnTask>
  ) {
  }
}
