import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HnTopicController } from './hn-topic.controller';
import { HnTopic } from './hn-topic.entity';
import { HnTopicService } from './hn-topic.service';

@Module({
  imports: [TypeOrmModule.forFeature([HnTopic])],
  exports: [TypeOrmModule],
  controllers: [HnTopicController],
  providers: [HnTopicService],
})
export class HnTopicModule {}
