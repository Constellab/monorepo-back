import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';

import { CnLabFolderAggregateService } from '../../cn-lab-folder-aggregate/cn-lab-folder-aggregate.service';
import { CnResourceAccessDTO } from './cn-resource.dto';
import { CnResource } from './cn-resource.entity';
import { CnResourceAggregateService } from './cn-resource-aggregate.service';

@Controller('resources')
export class CnResourcesController {
  constructor(
    private resourceAggregateService: CnResourceAggregateService,
    private labFolderAggregateService: CnLabFolderAggregateService
  ) {}

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnResourceAccessDTO> {
    return this.labFolderAggregateService.getResourceAccess(id);
  }

  @Put(':id/name')
  updateName(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any): Promise<CnResource> {
    return this.resourceAggregateService.renameResource(id, body.name);
  }
}
