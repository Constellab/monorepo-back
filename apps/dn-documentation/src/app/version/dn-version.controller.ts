import {Controller} from '@nestjs/common';
import {DnVersionService} from './dn-version.service';

@Controller('version')
export class DnVersionController {
  constructor(private readonly versionService: DnVersionService) {
  }
}
