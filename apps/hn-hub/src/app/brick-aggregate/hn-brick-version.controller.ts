import {Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards} from '@nestjs/common';
import {HnBrickVersionService} from './brick-version/hn-brick-version.service';
import {ClPageI} from '@monorepo/core-lib';
import {HnBrickVersion, HnReferenceDTO} from './brick-version/hn-brick-version.entity';
import {BlPublic} from '@monorepo/back-core-lib';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';

@Controller('brick-version')
@UseGuards(HnIsAdminGuard)
export class HnBrickVersionController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {
  }

  /**
   * Route to send all the brick version to the queue
   */
  @IsAdmin()
  @Put('send-all-to-queue')
  sendAllToQueue(): Promise<void> {
    return this.brickAggregateService.sendAllBrickVersionToQueue();
  }

  @BlPublic()
  @Get('current/:brickId')
  public getCurrentBrickVersion(@Param('brickId') brickId: string,
                            @Query('page', ParseIntPipe) page: number,
                            @Query('size', ParseIntPipe) size: number): Promise<ClPageI<HnBrickVersion>> {
    return this.brickAggregateService.getCurrentBrickVersion(page, size, brickId);
  }

  @BlPublic()
  @Get('references/:id')
  public getAllReferences(@Param('id') id: string): Promise<HnReferenceDTO[]>{
    return this.brickAggregateService.getAllBrickVersionReferences(id);
  }

  @BlPublic()
  @Get('direct-references/:id')
  public getDirectReferences(@Param('id') id: string): Promise<HnReferenceDTO[]>{
    return this.brickAggregateService.getBrickVersionDirectReferences(id);
  }


}
