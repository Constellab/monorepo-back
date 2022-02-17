import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnBrick} from './cn-brick.entity';
import {CnBricksService} from './cn-bricks.service';
import {CnBricksController} from './cn-bricks.controller';
import {CnBrickVersion} from './cn-brick-version.entity';
import {CnLabFrontVersionsModule} from '../cn-lab-front-versions/cn-lab-front-versions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CnBrick,
      CnBrickVersion,
    ]),

    CnLabFrontVersionsModule,
  ],
  providers: [CnBricksService],
  controllers: [CnBricksController],
  exports: [CnBricksService]
})
export class CnBricksModule {
}
