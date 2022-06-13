import {Controller} from '@nestjs/common';
import {HnBrickVersionReferenceService} from './hn-brick-version-reference.service';

@Controller('brick-major-version')
export class HnBrickVersionReferenceController {
  constructor(private readonly brickVersionReferenceService: HnBrickVersionReferenceService) {}


}
