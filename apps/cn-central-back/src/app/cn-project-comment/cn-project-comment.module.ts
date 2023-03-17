import {Module} from '@nestjs/common';
import {CnProjectCommentService} from './cn-project-comment.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';
import {CnProjectBucketModule} from '../cn-projects-aggregate/cn-project-bucket/cn-project-bucket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectComment]),
    CnNotificationModule,
    CnProjectBucketModule
  ],
  providers: [CnProjectCommentService],
  exports: [CnProjectCommentService]
})
export class CnProjectCommentModule {
}
