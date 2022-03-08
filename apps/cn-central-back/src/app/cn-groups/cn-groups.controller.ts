import {Controller, Get} from '@nestjs/common';
import {CnGroupsService} from './cn-groups.service';
import {CnGroup} from './cn-group.entity';

@Controller('groups')
export class CnGroupsController {

  constructor(private service: CnGroupsService) {
  }

  @Get()
  public test(): Promise<CnGroup[]> {
    return this.service.getCurrentUserGroups();
  }
}
