import {Controller, Get, Param, ParseIntPipe, Put, Query, UseGuards} from '@nestjs/common';
import {ClPage} from '@monorepo/core-lib';
import {HnReferenceDTO} from './brick-version/hn-brick-version.entity';
import {BlPublic} from '@monorepo/back-core-lib';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {HnBrickVersionDto} from './brick-version/hn-brick-version.dto';

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
                                @Query('size', ParseIntPipe) size: number): Promise<ClPage<HnBrickVersionDto>> {
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
