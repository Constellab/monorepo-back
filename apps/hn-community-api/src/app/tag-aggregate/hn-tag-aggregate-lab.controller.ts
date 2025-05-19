import { Controller } from '@nestjs/common';
import { HnTagAggregateService } from './hn-tag-aggregate.service';

@Controller('tag-lab')
export class HnTagAggregateLabController {
  constructor(private readonly tagAggregateService: HnTagAggregateService) {}
}
