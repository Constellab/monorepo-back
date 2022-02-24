import {Controller} from '@nestjs/common';
import {HnBrickMajorVersionService} from './hn-brick-major-version.service';

@Controller('brick-major-version')
export class HnBrickMajorVersionController {
  constructor(private readonly brickMajorVersionService: HnBrickMajorVersionService) {}


}
