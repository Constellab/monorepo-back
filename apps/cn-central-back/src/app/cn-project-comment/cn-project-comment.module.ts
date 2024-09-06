import { Module } from '@nestjs/common';
import { CnProjectCommentService } from './cn-project-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CnProjectComment } from './cn-project-comment.entity';
import { CnNotificationModule } from '../cn-notification/cn-notification.module';
import { CnProjectDocumentModule } from '../cn-projects-aggregate/cn-project-documents/cn-project-document.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CnProjectComment]),
    CnNotificationModule,
    CnProjectDocumentModule
  ],
  providers: [CnProjectCommentService],
  exports: [CnProjectCommentService]
})
export class CnProjectCommentModule {
}
