import { Controller } from '@nestjs/common';
import { HnTaskService } from './hn-task.service';

@Controller('task')
export class HnTaskController {
  constructor(private readonly hnTaskService: HnTaskService) {}
}
