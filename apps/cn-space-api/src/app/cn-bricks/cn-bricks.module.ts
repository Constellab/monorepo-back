import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CnBrick } from './cn-brick.entity';
import { CnBrickVersion } from './cn-brick-version.entity';
import { CnBricksController } from './cn-bricks.controller';
import { CnBricksProcessor } from './cn-bricks.processor';
import { CnBricksService } from './cn-bricks.service';

@Module({
  imports: [TypeOrmModule.forFeature([CnBrick, CnBrickVersion])],
  providers: [CnBricksService, CnBricksProcessor],
  controllers: [CnBricksController],
  exports: [CnBricksService],
})
export class CnBricksModule {}
