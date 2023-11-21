import {Injectable} from '@nestjs/common';
import {HnLiveTaskService} from './live-task/hn-live-task.service';
import {HnLiveTaskVersionService} from './live-task-version/hn-live-task-version.service';

@Injectable()
export class HnLiveTaskAggregateService {

  constructor(
    private readonly liveTaskService: HnLiveTaskService,
    private readonly liveTaskVersionService: HnLiveTaskVersionService
  ) {
  }
}
