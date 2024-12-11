import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnResource } from './cn-resource.entity';

@Controller('resources')
export class CnResourcesController {
  constructor(private folderAggregateService: CnFolderAggregateService) {}

  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnResource> {
    return this.folderAggregateService.findResource(id);
  }

  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.folderAggregateService.deleteResource(id);
  }

  @Put(':id/name')
  updateName(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: any): Promise<CnResource> {
    return this.folderAggregateService.renameResource(id, body.name);
  }
}
