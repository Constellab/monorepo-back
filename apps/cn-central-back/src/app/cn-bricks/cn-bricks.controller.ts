import {Controller, Get, Param} from '@nestjs/common';
import {CnBricksService} from './cn-bricks.service';
import {CnBrick} from './cn-brick.entity';
import {CnBrickVersion} from './cn-brick-version.entity';

@Controller('bricks')
export class CnBricksController {

  constructor(private service: CnBricksService) {
  }

  @Get()
  public getAllBricks(): Promise<CnBrick[]> {
    return this.service.getAllBricks();
  }

  @Get('versions/:brickName')
  public getBrickVersions(@Param('brickName') brickName: string): Promise<CnBrickVersion[]> {
    return this.service.getBrickVersions(brickName);
  }

}
