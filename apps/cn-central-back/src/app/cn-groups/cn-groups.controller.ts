import {Controller} from '@nestjs/common';
import {CnGroupsService} from './cn-groups.service';

@Controller('groups')
export class CnGroupsController {

  constructor(private service: CnGroupsService) {
  }
}
