import { BlFile, BlPublic, BlUploadedFile } from '@monorepo/back-core-lib';
import { Body, Controller, Get, Post, Put, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  CnConstellabSuiteDTO,
  CnFreeLabConfigDTO,
  CnRequestAppDTO,
  CnServerDecisionTreeDTO,
} from './cn-settings.entity';
import { CnSettingsService } from './cn-settings.service';
import { CnYoutubeService } from './cn-youtube.service';

@Controller('settings')
export class CnSettingsController {
  constructor(
    private settingsService: CnSettingsService,
    private youtubeService: CnYoutubeService
  ) {}

  /////////////////////////////// SERVER DECISION TREE /////////////////////////////////

  // public for data lab price simulator
  @BlPublic()
  @Get('server-decision-tree')
  public async getServerDecisionTree(): Promise<CnServerDecisionTreeDTO> {
    return this.settingsService.getServerDecisionTree();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('server-decision-tree')
  saveNewPhoto(@BlUploadedFile() file: BlFile): Promise<void> {
    return this.settingsService.updateServerDecisionTree(file);
  }

  /////////////////////////////// CONSTELLAB SUITE /////////////////////////////////

  @BlPublic()
  @Get('constellab-suite')
  public async getConstellabSuite(): Promise<CnConstellabSuiteDTO> {
    return this.settingsService.getConstellabSuite();
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('constellab-suite')
  updateConstellabSuite(@BlUploadedFile() file: BlFile): Promise<void> {
    return this.settingsService.updateConstellabSuite(file);
  }

  /////////////////////////////// FREE LAB CONFIG /////////////////////////////////

  @Get('free-lab-config')
  public async getFreeLabConfig(): Promise<CnFreeLabConfigDTO> {
    return this.settingsService.getFreeLabConfig();
  }

  @Put('free-lab-config')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateFreeLabConfig(@Body() freeLabConfig: CnFreeLabConfigDTO): Promise<CnFreeLabConfigDTO> {
    return this.settingsService.updateFreeLabConfig(freeLabConfig);
  }

  @Post('request-app')
  requestApp(@Body() requestAppDto: CnRequestAppDTO): Promise<void> {
    return this.settingsService.requestApp(requestAppDto);
  }

  @Get('tutorial-videos')
  public async getTutorialVideos(): Promise<any> {
    return this.youtubeService.getTutorialPlaylistVideos();
  }
}
