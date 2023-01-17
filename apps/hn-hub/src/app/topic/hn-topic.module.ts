import {Module} from '@nestjs/common';
import {HnTopicService} from './hn-topic.service';
import {HnTopicController} from './hn-topic.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {HnTopic} from './hn-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HnTopic])],
  exports: [TypeOrmModule],
  controllers: [HnTopicController],
  providers: [HnTopicService],
})
export class HnTopicModule {
}
