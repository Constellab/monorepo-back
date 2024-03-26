import {Module} from '@nestjs/common';
import {HnCommentBrickService} from './hn-comment-brick.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnCommentBrick} from './hn-comment-brick.entity';
import {HnBrickAggregateModule} from '../../brick-aggregate/hn-brick-aggregate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HnCommentBrick]),
    HnBrickAggregateModule
  ],
  providers: [HnCommentBrickService],
  exports: [TypeOrmModule, HnCommentBrickService]
})
export class HnCommentBrickModule {
}
