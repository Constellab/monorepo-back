import {Module} from '@nestjs/common';
import {CnProjectCommentService} from './cn-project-comment.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectComment]),
    CnNotificationModule
  ],
  providers: [CnProjectCommentService],
  exports: [CnProjectCommentService]
})
export class CnProjectCommentModule {
}
