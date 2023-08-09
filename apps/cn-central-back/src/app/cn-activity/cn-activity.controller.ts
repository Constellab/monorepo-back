import {Controller} from '@nestjs/common';
import {CnActivityService} from './cn-activity.service';

@Controller('activity')
export class CnActivityController {
  constructor(private readonly activityService: CnActivityService) {
  }


}
