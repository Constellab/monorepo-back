import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query, Req,
  Res, StreamableFile,
  UseInterceptors
} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlRichTextI,
  BlRichTextUploadedImage,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnStory, HnStoryCategory} from './hn-story.entity';
import {HnCreateStoryDto, HnStoryFilter} from './hn-story.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnTopicDto} from '../topic/hn-topic.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {HnStoryAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';
import {HnSitemapItemBase} from '../core/model/config/hn-site-map.class';
import {HnStoryFile} from '../story-file/hn-story-file.entity';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';

@Controller('story')
export class HnStoryController {
  constructor(private readonly storyService: HnStoryService) {
  }

  @BlPublic()
  @Get()
  async getStories(@Query('page', new ParseIntPipe()) page: number,
                   @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStory>> {
    return this.storyService.getStories(page, size);
  }

  @BlPublic()
  @Get('all-map')
  async getAllStoriesMap(): Promise<HnSitemapItemBase[]> {
    return this.storyService.getAllStoriesMap();
  }


  @BlPublic()
  @Post('filter')
  async getStoriesByFilter(@Body() filter: HnStoryFilter,
                           @Query('page', new ParseIntPipe()) page: number,
                           @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStory>> {
    return this.storyService.getStoriesByFilter(filter, page, size);
  }


  @BlPublic()
  @Get('topic/:topicId')
  async getStoriesByTopicId(@Param('topicId', new ParseUUIDPipe()) topicId: string,
                            @Query('page', new ParseIntPipe()) page: number,
                            @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStory>> {
    return this.storyService.getStoriesByTopicId(topicId, page, size);
  }

  /***
   * Get my stories paginated
   */
  @Get('my')
  async getMyStories(@Query('page', new ParseIntPipe()) page: number,
                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStory>> {
    return this.storyService.getMyStories(page, size);
  }

  @BlPublic()
  @Get(':id')
  async getStory(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return this.storyService.getStory(id);
  }

  @Post()
  async createStory(@Body(new BlParsePipe(HnCreateStoryDto)) createStoryDto: HnCreateStoryDto): Promise<HnStory> {
    return this.storyService.createStory(createStoryDto);
  }

  @Put(':id/title')
  async updateStoryTitle(@Param('id', new ParseUUIDPipe()) id: string,
                         @Body('title') title: string): Promise<HnStory> {
    return this.storyService.updateStoryTitle(id, title);
  }

  @Put(':id/category')
  async updateStoryCategory(@Param('id', new ParseUUIDPipe()) id: string,
                            @Body('category') category: HnStoryCategory): Promise<HnStory> {
    return this.storyService.updateStoryCategory(id, category);
  }

  @Put(':id/add-topic')
  async updateAddStoryTopic(@Param('id', new ParseUUIDPipe()) id: string,
                            @Body() topic: HnTopicDto): Promise<HnTopic> {
    return this.storyService.addStoryTopic(id, topic);
  }

  @Put(':id/remove-topic/:topicId')
  async updateRemoveStoryTopic(@Param('id', new ParseUUIDPipe()) id: string,
                               @Param('topicId', new ParseUUIDPipe()) topicId: string): Promise<HnStory> {
    return this.storyService.removeTopic(id, topicId);
  }

  @Put(':id/content')
  async updateStoryContent(@Param('id', new ParseUUIDPipe()) id: string,
                           @Body('content') content: BlRichTextI): Promise<HnStory> {
    return this.storyService.updateStoryContent(id, content);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('image/:storyId')
  saveImage(@BlUploadedFile() file: BlFile,
            @Param('storyId', new ParseUUIDPipe()) storyId: string): Promise<BlRichTextUploadedImage> {
    return this.storyService.saveImage(file, storyId);
  }


  /***
    * Get story image
   * @param request
   * @param response
   */
  @BlPublic()
  @Get('image/*')
  async getImage(@Req() request: Request,
                 @Res() response: Response): Promise<any> {
    const filename = request.url.split('image/')[1];
    const file = await this.storyService.getStoryImage(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }


  /***
   * Get story file
   * @param storyFileId
   * @param res
   */
  @BlPublic()
  @Get('get-file/:storyFileId')
  public async getFile(@Param('storyFileId') storyFileId: string,
                       @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const file = await this.storyService.getStoryFile(storyFileId);
    const fileName: string = await this.storyService.getStoryFileName(storyFileId);
    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return BlResponseHelper.getFileResponse(file);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:storyId')
  async saveFile(@BlUploadedFile() file: BlFile,
                 @Param('storyId', new ParseUUIDPipe()) storyId: string): Promise<HnStoryFile> {
    return this.storyService.saveFile(file, storyId);
  }

  @Put('file/:storyFileId/rename')
  async updateStoryFile(@Param('storyFileId', new ParseUUIDPipe()) storyFileId: string,
                        @Body('humanName') humanName: string): Promise<HnStoryFile> {
    return this.storyService.renameStoryFile(storyFileId, humanName);
  }

  @Delete('file/:storyFileId')
  async deleteStoryFile(@Param('storyFileId', new ParseUUIDPipe()) storyFileId: string): Promise<void> {
    return this.storyService.deleteStoryFile(storyFileId);
  }

  /***
   * Publish the story
   */
  @Put(':id/publish')
  async publishStory(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return this.storyService.publishStory(id);
  }


  /***
   * Check if the current user is the owner of the story
   */
  @Get(':id/is-owner-or-co-author')
  async isStoryOwnerOrCoAuthor(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return this.storyService.isStoryOwnerOrCoAuthor(id);
  }

  @Post(':id/invite-co-author')
  async inviteStoryCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                            @Body('coAuthorMail') coAuthorMail: string): Promise<boolean> {
    return this.storyService.inviteStoryCoAuthor(id, coAuthorMail);
  }

  /***
   * Update Story Co Authors
   */
  @Put(':id/co-authors')
  async updateStoryCoAuthors(@Param('id', new ParseUUIDPipe()) id: string,
                             @Body() coAuthors: string[]): Promise<HnStory> {
    return this.storyService.updateStoryCoAuthors(id, coAuthors);
  }

  @Get(':id/co-authors-pending-invites')
  async getStoryCoAuthorsPendingInvites(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStoryAuthorInvite[]> {
    return this.storyService.getStoryCoAuthorsPendingInvites(id);
  }

  /***
   * Remove story co-author
   */
  @Put(':id/remove-co-author/:storyAuthorUserId')
  async removeStoryCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('storyAuthorUserId', new ParseUUIDPipe()) storyAuthorUserId: string): Promise<void> {
    return this.storyService.removeStoryCoAuthor(id, storyAuthorUserId);
  }


  /***
   * Is invite valid
   */
  @Get('invite/:token/is-valid')
  isInviteValid(@Param('token') token: string): Promise<HnStoryAuthorInvite> {
    return this.storyService.isInviteValid(token);
  }

  /***
   * Accept invite
   */
  @Put('invite/:token/accept')
  acceptInvite(@Param('token') token: string): Promise<HnStory> {
    return this.storyService.acceptInvite(token);
  }


  @Post('structure-stories-bucket')
  structureStoriesBucket(): Promise<void> {
    return this.storyService.structureStoriesBucket();
  }

  @Delete('invite/:inviteId')
  async deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.storyService.deleteCoAuthorInvite(inviteId);
  }

  @IsAdmin()
  @Post('migrate-stories')
  public async migrateStories(): Promise<void> {
    return await this.storyService.migrateStories();
  }
}
