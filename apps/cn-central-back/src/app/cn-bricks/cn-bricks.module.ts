import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnBrick} from './cn-brick.entity';
import {CnBricksService} from './cn-bricks.service';
import {CnBricksController} from './cn-bricks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnBrick])
  ],
  providers: [CnBricksService],
  controllers: [CnBricksController]
})
export class CnBricksModule {
}
