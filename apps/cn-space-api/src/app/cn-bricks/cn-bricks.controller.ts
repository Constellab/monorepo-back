import { BlVersion } from '@monorepo/back-core-lib';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { CnBrick } from './cn-brick.entity';
import { CnBrickVersion } from './cn-brick-version.entity';
import { CnBricksService } from './cn-bricks.service';

@Controller('bricks')
export class CnBricksController {
  constructor(private service: CnBricksService) {}

  @Get()
  public getAllBricks(): Promise<CnBrick[]> {
    return this.service.getAllBricks();
  }

  @Get('brick-version/:brickVersionId')
  public getById(@Param('brickVersionId', ParseUUIDPipe) brickVersionId: string): Promise<CnBrick> {
    return this.service.getByBrickVersionId(brickVersionId);
  }

  @Get(':brickName/versions')
  public getBrickVersions(@Param('brickName') brickName: string): Promise<CnBrickVersion[]> {
    return this.service.getBrickVersions(brickName);
  }

  @Get(':brickName/versions/:version')
  public getBrickVersion(
    @Param('brickName') brickName: string,
    @Param('version') brickVersion: string
  ): Promise<CnBrickVersion> {
    return this.service.getBrickVersion(brickName, BlVersion.fromString(brickVersion));
  }
}
