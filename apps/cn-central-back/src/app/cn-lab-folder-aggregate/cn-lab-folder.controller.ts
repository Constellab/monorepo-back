import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CnLabFolder, CnLabFolderWithRootFolder } from './cn-lab-folder.entity';
import { CnLabFolderAggregateService } from './cn-lab-folder-aggregate.service';

@Controller('lab-folder')
export class CnLabFolderController {

  constructor(private folderAggregateService: CnLabFolderAggregateService) {
  }


  //////////////////////////// FOLDER ////////////////////////////////

  @Post(':id/folder/:folderId')
  public addFolder(@Param('id', new ParseUUIDPipe()) id: string,
                   @Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<CnLabFolder> {
    return this.folderAggregateService.addFolderToLab(id, folderId);
  }

  @Delete(':id/folder/:folderId')
  public removeFolder(@Param('id', new ParseUUIDPipe()) id: string,
                      @Param('folderId', new ParseUUIDPipe()) folderId: string): Promise<void> {
    return this.folderAggregateService.checkAndRemoveFolderFromLab(id, folderId);
  }

  @Get(':id/folder')
  public getFolders(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabFolderWithRootFolder[]> {
    return this.folderAggregateService.getLabInstanceFolders(id);
  }

  @Put(':id/folder/:rootFolderId/sync')
  public forceSync(@Param('id', new ParseUUIDPipe()) id: string,
                   @Param('rootFolderId', new ParseUUIDPipe()) rootFolderId: string): Promise<void> {
    return this.folderAggregateService.forceFolderSyncToLab(id, rootFolderId);
  }
}
