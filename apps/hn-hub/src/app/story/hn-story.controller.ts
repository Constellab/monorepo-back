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
  UseInterceptors
} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnStory, HnStoryCategory} from './hn-story.entity';
import {HnCreateStoryDto, HnStoryDto, HnStoryFilter} from './hn-story.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {HnTopicDto} from '../topic/hn-topic.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {HnStoryCoAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';
import {HnSitemapItemBase} from '../core/model/config/hn-site-map.class';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {HnUserDto} from '../users/hn-user.dto';
import {HnFileStoryService} from '../file-aggregate/file-story/hn-file-story.service';
import {HnAbstractFileController} from '../file-aggregate/file-core/hn-abstract-file.controller';
import {HnUploadFileResponseDto} from '../file-aggregate/file-core/hn-abstract-file.dto';

@Controller('story')
export class HnStoryController extends HnAbstractFileController<HnStory> {
  constructor(private readonly storyService: HnStoryService,
              private readonly fileStoryService: HnFileStoryService) {
    super(fileStoryService);
  }

  @IsAdmin()
  @Get('bucket-items')
  async getAllBucketItemsName(): Promise<any> {
    return this.storyService.migrateStoryBucketItemsNames();
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
                           @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStoryDto>> {
    return this.storyService.getStoriesByFilter(filter, page, size);
  }


  @BlPublic()
  @Get('topic/:topicId')
  async getStoriesByTopicId(@Param('topicId', new ParseUUIDPipe()) topicId: string,
                            @Query('page', new ParseIntPipe()) page: number,
                            @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStoryDto>> {
    return this.storyService.getStoriesByTopicId(topicId, page, size);
  }

  /***
   * Get my stories paginated
   */
  @Get('my')
  async getMyStories(@Query('page', new ParseIntPipe()) page: number,
                     @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStoryDto>> {
    return this.storyService.getMyStories(page, size);
  }

  /***
   * Get my stories paginated
   */
  @Post('my-filtered')
  async getMyStoriesFiltered(
    @Body() filters: HnStoryFilter,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStoryDto>> {
    return await this.storyService.getMyStoriesFiltered(page, size, filters);
  }

  /***
    * Get user stories paginated
    */
  @BlPublic()
  @Get('user/:userId')
  async getUserStories(@Param('userId', new ParseUUIDPipe()) userId: string,
                       @Query('page', new ParseIntPipe()) page: number,
                       @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnStoryDto>> {
    return this.storyService.getUserStories(userId, page, size);
  }

  @BlPublic()
  @Get('title/:id')
  async getStoryTitle(@Param('id', new ParseUUIDPipe()) id: string): Promise<string> {
    return this.storyService.getStoryTitle(id);
  }

  @BlPublic()
  @Get(':id')
  async getStory(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStoryDto> {
    return new HnStoryDto(await this.storyService.getStory(id));
  }

  @Delete(':id')
  async deleteStory(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.storyService.deleteStory(id);
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

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/main-image')
  async updateStoryMainImage(@BlUploadedFile() file: BlFile,
                             @Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return await this.storyService.updateStoryMainImage(file, id);
  }

  @Delete(':id/main-image')
  async deleteStoryMainImage(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return this.storyService.deleteStoryMainImage(id);
  }

  @Put(':id/remove-topic/:topicId')
  async updateRemoveStoryTopic(@Param('id', new ParseUUIDPipe()) id: string,
                               @Param('topicId', new ParseUUIDPipe()) topicId: string): Promise<HnStory> {
    return this.storyService.removeTopic(id, topicId);
  }

  @Put(':id/content')
  async updateStoryContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return this.storyService.updateStoryContent(id);
  }

  @Put(':id/content-edition')
  async updateStoryContentEdition(@Param('id', new ParseUUIDPipe()) id: string,
                                  @Body('contentEdition') contentEdition: BlRichTextContent): Promise<HnStory> {
    return this.storyService.updateStoryContentEdition(id, contentEdition);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('image/:storyId')
  saveImage(@BlUploadedFile() file: BlFile,
            @Param('storyId', new ParseUUIDPipe()) storyId: string): Promise<BlRichTextUploadedImageResponse> {
    return this.storyService.saveImage(file, storyId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:storyId')
  async saveFile(@BlUploadedFile() file: BlFile,
                 @Param('storyId', new ParseUUIDPipe()) storyId: string): Promise<HnUploadFileResponseDto> {
    return this.storyService.saveFile(file, storyId);
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
    return await this.storyService.isStoryOwnerOrCoAuthor(id);
  }

  @Post(':id/invite-co-author')
  async inviteStoryCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                            @Body('coAuthorMail') coAuthorMail: string): Promise<boolean> {
    return this.storyService.inviteStoryCoAuthor(id, coAuthorMail);
  }

  @BlPublic()
  @Get(':id/co-authors')
  async getStoryCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDto[]> {
    return (await this.storyService.getStoryCoAuthors(id)).map(storyAuthor => new HnUserDto(storyAuthor.user));
  }

  @Get(':id/co-authors-pending-invites')
  async getStoryCoAuthorsPendingInvites(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStoryCoAuthorInvite[]> {
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
  isInviteValid(@Param('token') token: string): Promise<HnStoryCoAuthorInvite> {
    return this.storyService.isInviteValid(token);
  }

  /***
   * Accept invite
   */
  @Put('invite/:token/accept')
  acceptInvite(@Param('token') token: string): Promise<HnStory> {
    return this.storyService.acceptInvite(token);
  }

  @Delete('invite/:inviteId')
  async deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.storyService.deleteCoAuthorInvite(inviteId);
  }

  ////////////////////////////////// STORY RESOURCE VIEW //////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':storyId/upload-view')
  public async saveResourceViewFile(@BlUploadedFile() file: BlFile,
                                    @Param('storyId', new ParseUUIDPipe()) storyId: string): Promise<any> {
    return {filename: await this.storyService.uploadStoryResourceViewFile(storyId, file)};
  }

  @IsAdmin()
  @Post('set-created-by')
  public async setCreatedBy(): Promise<void> {
    return this.storyService.setCreatedBy();
  }
}
