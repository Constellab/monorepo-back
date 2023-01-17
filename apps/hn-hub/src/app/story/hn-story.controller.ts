import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query} from '@nestjs/common';
import {HnStoryService} from './hn-story.service';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {HnStory} from './hn-story.entity';
import {HnCreateStoryDto} from './hn-story.dto';

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

  @BlPublic()
  @Get(':id')
  async getStory(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnStory> {
    return this.storyService.getStory(id);
  }

  @Post()
  async createStory(@Body(new BlParsePipe(HnCreateStoryDto)) createStoryDto: HnCreateStoryDto): Promise<HnStory> {
    return this.storyService.createStory(createStoryDto.title);
  }

}
