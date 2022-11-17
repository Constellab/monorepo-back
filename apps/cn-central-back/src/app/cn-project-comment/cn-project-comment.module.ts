import {Module} from '@nestjs/common';
import {CnProjectCommentService} from './cn-project-comment.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {CnNotificationModule} from '../cn-notification/cn-notification.module';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectComment]),
    CnNotificationModule
  ],
  providers: [CnProjectCommentService, CnCoreConfigService],
  exports: [CnProjectCommentService]
})
export class CnProjectCommentModule {
}
