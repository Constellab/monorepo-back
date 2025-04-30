import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';
import { BlFile, BlParsePipe, BlPublic, BlResponseHelper, BlUploadedFile } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Response } from 'express';
import { HnCommunityAppDto, HnCommunityAppEditDto } from './community-app/hn-community-app.dto';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import { HnCommunityApp } from './community-app/hn-community-app.entity';
import { HnFileAppService } from '../file-aggregate/file-app/hn-file-app.service';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichTextDTO,
} from '@monorepo/te-text-editor';
import { FileInterceptor } from '@nestjs/platform-express';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';

@Controller('app')
export class HnCommunityAppController extends HnAbstractFileController<HnCommunityApp> {
  constructor(
    private readonly communityAppAggregateService: HnCommunityAppAggregateService,
    fileAppService: HnFileAppService
  ) {
    super(fileAppService);
  }

  @BlPublic()
  @Get('all-map')
  async getAllAppsMap(): Promise<HnSitemapItemBase[]> {
    return this.communityAppAggregateService.getAllAppsMap();
  }

  @BlPublic()
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.findOneById(id));
  }

  @BlPublic()
  @Get('app-picture/:filename')
  async getAppPicture(@Param('filename') filename: string, @Res() res: Response): Promise<any> {
    const file = await this.communityAppAggregateService.getAppPicture(filename);
    BlResponseHelper.setFileResponseAndCache(res, file);
  }

  /**
   * Get user community apps
   * @param userId
   * @param page
   * @param size
   * @returns apps
   */
  @BlPublic()
  @Get('user/:userId')
  async getUserCommunityApps(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnCommunityAppDto>> {
    const result: ClPage<HnCommunityApp> = await this.communityAppAggregateService.findUserCommunityApps(
      userId,
      page,
      size
    );
    return result.map((communityApp) => new HnCommunityAppDto(communityApp));
  }

  /**
   * Get all community apps with filters
   * @param spacesFilter
   * @param titleFilter
   * @param page
   * @param size
   */
  @BlPublic()
  @Post('filters')
  async getAll(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnCommunityAppDto>> {
    const result = await this.communityAppAggregateService.findAll(spacesFilter, titleFilter, page, size);
    return result.map((communityApp) => new HnCommunityAppDto(communityApp));
  }

  @Post()
  async create(
    @Body(new BlParsePipe(HnCommunityAppEditDto)) dto: HnCommunityAppEditDto
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.create(dto));
  }

  @Put()
  async update(
    @Body(new BlParsePipe(HnCommunityAppEditDto)) dto: HnCommunityAppEditDto
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.update(dto));
  }

  @Put('description/:appId')
  async updateDescription(
    @Param('appId', new ParseUUIDPipe()) appId: string,
    @Body('description') description: TeRichTextDTO
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(
      await this.communityAppAggregateService.updateDescription(appId, description)
    );
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('app-picture')
  async saveAppPicture(@BlUploadedFile() file: BlFile): Promise<any> {
    const filename = await this.communityAppAggregateService.saveAppPicture(file);
    return { filename: filename };
  }

  @Delete('app-picture/:filename')
  async deleteAppPicture(@Param('filename') filename: string): Promise<boolean> {
    return this.communityAppAggregateService.deleteAppPicture(filename);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:appId')
  async saveFile(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<TeBlockFileUploadResponse> {
    return this.communityAppAggregateService.saveFile(file, appId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('image/:appId')
  async saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.communityAppAggregateService.saveImage(file, appId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('view/:appId')
  async saveResourceViewFile(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<any> {
    return this.communityAppAggregateService.saveResourceViewFile(file, appId);
  }
}
