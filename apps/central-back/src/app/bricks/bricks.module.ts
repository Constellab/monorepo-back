import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Brick} from './brick.entity';
import { BricksService } from './bricks.service';
import { BricksController } from './bricks.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brick])
  ],
  providers: [BricksService],
  controllers: [BricksController]
})
export class BricksModule {
}
