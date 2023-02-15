import {Controller, Get, Param, ParseUUIDPipe} from '@nestjs/common';
import {CnBricksService} from './cn-bricks.service';
import {CnBrick} from './cn-brick.entity';
import {CnBrickVersion} from './cn-brick-version.entity';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {CnBrickSaveDTO} from './cn-brick.dto';
import {CmVersion} from '@monorepo/common-model';

@Controller('bricks')
export class CnBricksController {

  constructor(private service: CnBricksService) {
  }

  @Get()
  public getAllBricks(): Promise<CnBrick[]> {
    return this.service.getAllBricks();
  }

  @Get('brick-version/:brickVersionId')
  public getById(@Param('brickVersionId', ParseUUIDPipe) brickVersionId: string):Promise<CnBrick>{
    return this.service.getByBrickVersionId(brickVersionId);
  }

  @Get(':brickName/versions')
  public getBrickVersions(@Param('brickName') brickName: string): Promise<CnBrickVersion[]> {
    return this.service.getBrickVersions(brickName);
  }

  @Get(':brickName/versions/:version')
  public getBrickVersion(@Param('brickName') brickName: string,
                         @Param('version') brickVersion: string): Promise<CnBrickVersion> {
    return this.service.getBrickVersion(brickName, CmVersion.fromString(brickVersion));
  }

  @EventPattern('brick')
  async handleBrickVersion(brickDto: CnBrickSaveDTO): Promise<void> {
    return this.service.saveBrick(brickDto);
  }
}
