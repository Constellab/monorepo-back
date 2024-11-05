import { Controller, Get, Put, UseInterceptors } from '@nestjs/common';
import { CnSettingsService } from './cn-settings.service';
import { CnServerDecisionTreeDTO } from './cn-settings.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlFile, BlUploadedFile } from '@monorepo/back-core-lib';

@Controller('settings')
export class CnSettingsController {
  constructor(private settingsService: CnSettingsService) {}

  /////////////////////////////// SERVER DECISION TREE /////////////////////////////////

  @Get('server-decision-tree')
  public async getServerDecisionTree(): Promise<CnServerDecisionTreeDTO> {
    return this.settingsService.getServerDecisionTree();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('server-decision-tree')
  saveNewPhoto(@BlUploadedFile() file: BlFile): Promise<void> {
    return this.settingsService.updateServerDecisionTree(file);
  }
}
