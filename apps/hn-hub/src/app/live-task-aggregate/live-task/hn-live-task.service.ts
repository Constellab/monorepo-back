import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnLiveTask} from './hn-live-task.entity';

@Injectable()
export class HnLiveTaskService {
  constructor(
    @InjectRepository(HnLiveTask)
    private liveTaskRepository: Repository<HnLiveTask>
  ) {
  }
}
