import {Controller, Get, Param, ParseIntPipe, Put, Query} from '@nestjs/common';
import {HnBrickVersionService} from './hn-brick-version.service';
import {ClPageI} from '@monorepo/core-lib';
import {HnBrickVersion} from './hn-brick-version.entity';
import {BlPublic} from '@monorepo/back-core-lib';

@Controller('brick-version')
export class HnBrickVersionController {
  constructor(private readonly brickVersionService: HnBrickVersionService) {
  }


  /**
   * Route to send all the brick version to the queue
   */
  @Put('send-all-to-queue')
  sendAllToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }


  @BlPublic()
  @Get('current/:brickId')
  public getCurrentBrickVersion(@Param('brickId') brickId: string,
                            @Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<HnBrickVersion>> {
    return this.brickVersionService.getCurrentBrickVersion(page, size, brickId);
  }

}
