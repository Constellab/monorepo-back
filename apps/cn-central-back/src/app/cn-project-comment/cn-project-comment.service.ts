import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnProjectComment } from './cn-project-comment.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CnProject } from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import { CnNewCommentDTO } from '../cn-core/model/entities/cn-comment.entity';
import { ClPage } from '@monorepo/core-lib';
import {
  BlAbstractService,
  BlFile,
  BlFileResponse,
  BlNewRichText,
  BlRichTextContent,
  BlRichTextUploadedImageResponse
} from '@monorepo/back-core-lib';
import { CnProjectDocumentService } from '../cn-projects-aggregate/cn-project-documents/cn-project-document.service';
import { CnProjectDocumentType } from '../cn-projects-aggregate/cn-project-documents/cn-project-document.entity';

@Injectable()
export class CnProjectCommentService extends BlAbstractService<CnProjectComment> {

  protected readonly logger = new Logger(CnProjectCommentService.name);


  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              private projectDocumentService: CnProjectDocumentService,
              private datasource: DataSource) {
    super(repository, CnProjectComment);
  }

  async saveProjectCommentImage(file: BlFile, project: CnProject): Promise<BlRichTextUploadedImageResponse> {
    return this.projectDocumentService.uploadImageDocument(file, project,
      CnProjectDocumentType.COMMENT_CONTENT, project.id);
  }

  async deleteComment(comment: CnProjectComment, projectId: string): Promise<void> {
    return this.datasource.transaction(async entityManager => {
      await this.deleteById(comment.id, entityManager);

      // delete all the images of the comment
      const richText = new BlNewRichText(comment.content);
      for (const image of richText.getFiguresBlocks()) {
        const document = await this.projectDocumentService.findDocumentByProjectAndTypeAndName(
          projectId, CnProjectDocumentType.COMMENT_CONTENT, image.data.filename, projectId);

        if (document) {
          await this.projectDocumentService.deleteDocument(document.id, entityManager);
        }
      }
    });
  }

  async getCommentImage(project: CnProject, documentName: string): Promise<BlFileResponse> {
    return this.projectDocumentService.getDocumentContentByTypeAndName(project, CnProjectDocumentType.COMMENT_CONTENT,
      documentName, project.id);
  }

  async createComment(newComment: CnNewCommentDTO, project: CnProject): Promise<CnProjectComment> {
    const projectComment: CnProjectComment = CnProjectComment.create(newComment, project);
    if (newComment.parentCommentId) {
      projectComment.parentComment = await this.repository.findOneBy({ id: newComment.parentCommentId });
    }
    return await this.create(projectComment);
  }

  async getProjectComments(projectId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    return this.findPaginated(page, size, {
      where: {
        project: {
          id: projectId
        },
        parentComment: IsNull()
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.repository.manager);
  }

  async updateComment(comment: CnProjectComment, content: BlRichTextContent): Promise<CnProjectComment> {
    comment.content = content;
    return await this.update(comment);
  }
}
