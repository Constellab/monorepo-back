import {Controller, Get} from '@nestjs/common';
import {CnGroupsService} from './cn-groups.service';
import {CnGroup} from './cn-group.entity';

@Controller('groups')
export class CnGroupsController {

  constructor(private service: CnGroupsService) {
  }

  @Get('current')
  public getCurrentGroups(): Promise<CnGroup[]> {
    return this.service.getCurrentUserGroups();
  }

}
