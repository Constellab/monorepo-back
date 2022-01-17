import {Controller} from '@nestjs/common';
import {HnBrickVersionService} from './hn-brick-version.service';

@Controller('brick-version')
export class HnBrickVersionController {
  constructor(private readonly brickVersionService: HnBrickVersionService) {}


}
