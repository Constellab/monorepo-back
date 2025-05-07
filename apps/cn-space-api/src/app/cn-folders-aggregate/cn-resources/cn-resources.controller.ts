import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnResource } from './cn-resource.entity';
import { CnLabFolderAggregateService } from '../../cn-lab-folder-aggregate/cn-lab-folder-aggregate.service';
import { CnResourceAccessDTO } from './cn-resource.dto';

@Controller('resources')
export class CnResourcesController {
  constructor(
    private folderAggregateService: CnFolderAggregateService,
    private labFolderAggregateService: CnLabFolderAggregateService
  ) {}

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnResourceAccessDTO> {
    return this.labFolderAggregateService.getResourceAccess(id);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.folderAggregateService.deleteResource(id);
  }

  @Put(':id/name')
  updateName(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any): Promise<CnResource> {
    return this.folderAggregateService.renameResource(id, body.name);
  }

  @Put(':id/move/:folderId')
  move(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('folderId', new ParseUUIDPipe()) folderId: string
  ): Promise<CnResource> {
    return this.folderAggregateService.moveResource(id, folderId);
  }
}
