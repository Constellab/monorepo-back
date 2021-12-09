import {Controller} from '@nestjs/common';
import {DnBrickVersionService} from './dn-brick-version.service';

@Controller('brick-version')
export class DnBrickVersionController {
  constructor(private readonly brickVersionService: DnBrickVersionService) {}


}
