import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
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
import {HnStory} from './hn-story.entity';
import {HnCreateStoryDto, HnStoryFilter} from './hn-story.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnTopicDto} from '../topic/hn-topic.dto';
import {HnTopic} from '../topic/hn-topic.entity';
import {HnStoryAuthorInvite} from '../story-author-invite/hn-story-author-invite.entity';

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
  async getAllStoriesMap(): Promise<string[]> {
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

  @BlPublic()
  @Get('image/:filename')
  async getImage(@Param('filename') filename: string,
                 @Res() response: Response): Promise<any> {
    const file = await this.storyService.getImage(filename);
    BlResponseHelper.setMessageAndCache(response, file);
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

  /***
   * Update Story Co Authors
   */
  @Put(':id/co-authors')
  async updateStoryCoAuthors(@Param('id', new ParseUUIDPipe()) id: string,
                             @Body() coAuthors: string[]): Promise<HnStory> {
    return this.storyService.updateStoryCoAuthors(id, coAuthors);
  }

  /***
   * Remove story co-author
   */
  @Put(':id/remove-co-author/:storyAuthorId')
  async removeStoryCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                            @Param('storyAuthorId', new ParseUUIDPipe()) storyAuthorId: string): Promise<void> {
    return this.storyService.removeStoryCoAuthor(id, storyAuthorId);
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
}
