import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnSpaceLiveTask} from './hn-space-live-task.entity';

@Injectable()
export class HnSpaceLiveTaskService {

  constructor(
    @InjectRepository(HnSpaceLiveTask)
    private spaceLiveTaskRepository: Repository<HnSpaceLiveTask>
  ) {
  }

}
