import {Module} from '@nestjs/common';
import {CnProjectCommentService} from './cn-project-comment.service';
import {CnProjectCommentController} from './cn-project-comment.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectComment]),
    CnNotificationModule
  ],
  controllers: [CnProjectCommentController],
  providers: [CnProjectCommentService],
  exports: [CnProjectCommentService]
})
export class CnProjectCommentModule {
}
