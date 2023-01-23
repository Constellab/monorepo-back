import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query, Res, UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {BlFile, BlParsePipe, BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnStory} from './hn-story.entity';
import {HnCreateStoryDto} from './hn-story.dto';
import {CmRichTextI} from '@monorepo/common-model';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';

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
    return this.storyService.createStory(createStoryDto.title);
  }

  @Put(':id/title')
  async updateStoryTitle(@Param('id', new ParseUUIDPipe()) id: string,
                          @Body('title') title: string): Promise<HnStory> {
    return this.storyService.updateStoryTitle(id, title);
  }

  @Put(':id/content')
  async updateStoryContent(@Param('id', new ParseUUIDPipe()) id: string,
                            @Body('content') content: CmRichTextI): Promise<HnStory> {
    return this.storyService.updateStoryContent(id, content);
  }

  @UseInterceptors(FilesInterceptor('file'))
  @Put('image')
  saveImage(@UploadedFiles() files: BlFile[]): Promise<any>{
    return this.storyService.saveImage(files);
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


}
