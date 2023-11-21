import {Controller} from '@nestjs/common';
import {HnLiveTaskAggregateService} from './hn-live-task-aggregate.service';

@Controller('live-task')
export class HnLiveTaskController {

  constructor(private readonly liveTaskAggregateService: HnLiveTaskAggregateService) {
  }
}
