import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Res } from '@nestjs/common';
import { Response } from 'express';

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
   * Get the access info (access url + validity) for a resource.
   *
   * The access url opens the resource/app in place (resource-open page), so the
   * app is NOT opened in a new tab. Used by the space UI to display the resource.
   */
  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnResourceAccessDTO> {
    return this.labFolderAggregateService.getResourceAccess(id, false);
  }

  /**
   * Redirect the browser directly to the resource access url.
   *
   * The access url points to the app launcher gateway, so the app IS opened in a
   * new tab. Used when following a direct link to the resource.
   */
  @Get(':id/redirect')
  async redirectToAccessUrl(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response
  ): Promise<void> {
    const access = await this.labFolderAggregateService.getResourceAccess(id, true);
    res.redirect(access.accessUrl);
  }

  @Put(':id/name')
  updateName(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any): Promise<CnResource> {
    return this.resourceAggregateService.renameResource(id, body.name);
  }
}
