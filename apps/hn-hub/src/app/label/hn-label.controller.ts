import { Controller } from '@nestjs/common';
import { HnLabelService } from './hn-label.service';

@Controller('hn-story-label')
export class HnLabelController {
  constructor(private readonly hnStoryLabelService: HnLabelService) {}
}
