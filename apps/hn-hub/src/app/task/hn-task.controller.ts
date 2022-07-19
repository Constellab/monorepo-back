import {Controller, Get} from '@nestjs/common';
import {HnTaskService} from './hn-task.service';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('task')
export class HnTaskController {
  constructor(private taskService: HnTaskService) {
  }

  @BlPublic()
  @Get('task-of-the-day')
  GetTaskOfTheDay(): Promise<any>{
    return this.taskService.getTaskOfTheDay();
  }
}
