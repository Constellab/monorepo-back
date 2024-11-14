import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnBrick } from './cn-brick.entity';
import { CnBricksService } from './cn-bricks.service';
import { CnBricksController } from './cn-bricks.controller';
import { CnBrickVersion } from './cn-brick-version.entity';
import { CnBricksProcessor } from './cn-bricks.processor';

@Module({
  imports: [TypeOrmModule.forFeature([CnBrick, CnBrickVersion])],
  providers: [CnBricksService, CnBricksProcessor],
  controllers: [CnBricksController],
  exports: [CnBricksService],
})
export class CnBricksModule {}
