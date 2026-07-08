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

  /**
   * Get the access info for a resource: the embedded url (open in place) and the
   * standalone url (open in a new tab through the launcher gateway).
   *
   * The frontend calls this via XHR and opens the new tab itself (window.open),
   * so the request carries the normal auth/space context and any error (e.g. the
   * lab is not running) is handled in the SPA instead of shown as a JSON page.
   */
  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnResourceAccessDTO> {
    return this.labFolderAggregateService.getResourceAccess(id);
  }

  @Put(':id/name')
  updateName(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any): Promise<CnResource> {
    return this.resourceAggregateService.renameResource(id, body.name);
  }
}
