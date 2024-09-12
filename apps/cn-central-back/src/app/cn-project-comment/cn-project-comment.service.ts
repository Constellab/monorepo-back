import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnProjectComment } from './cn-project-comment.entity';
import { DataSource, IsNull, Repository } from 'typeorm';
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
import { CnFolderHierarchy } from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';

@Injectable()
export class CnProjectCommentService extends BlAbstractService<CnProjectComment> {

  protected readonly logger = new Logger(CnProjectCommentService.name);


  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              private projectDocumentService: CnProjectDocumentService,
              private datasource: DataSource) {
    super(repository, CnProjectComment);
  }

  async saveFolderCommentImage(file: BlFile, folder: CnFolderHierarchy): Promise<BlRichTextUploadedImageResponse> {
    return this.projectDocumentService.uploadImageDocument(file, folder,
      CnProjectDocumentType.COMMENT_CONTENT, folder.id);
  }

  async deleteComment(comment: CnProjectComment, folderId: string): Promise<void> {
    return this.datasource.transaction(async entityManager => {
      await this.deleteById(comment.id, entityManager);

      // delete all the images of the comment
      const richText = new BlNewRichText(comment.content);
      for (const image of richText.getFiguresBlocks()) {
        const document = await this.projectDocumentService.findDocumentBYTypeAndNameAndEntity(
          CnProjectDocumentType.COMMENT_CONTENT, image.data.filename, folderId);

        if (document) {
          await this.projectDocumentService.deleteDocument(document.id, entityManager);
        }
      }
    });
  }

  async getCommentImage(folder: CnFolderHierarchy, documentName: string): Promise<BlFileResponse> {
    return this.projectDocumentService.getDocumentContentByTypeAndName(folder.getRootFolderId(), CnProjectDocumentType.COMMENT_CONTENT,
      documentName, folder.id);
  }

  async createComment(newComment: CnNewCommentDTO, folder: CnFolderHierarchy): Promise<CnProjectComment> {
    const projectComment: CnProjectComment = CnProjectComment.create(newComment, folder);
    if (newComment.parentCommentId) {
      projectComment.parentComment = await this.repository.findOneBy({ id: newComment.parentCommentId });
    }
    return await this.create(projectComment);
  }

  async getProjectComments(folderId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    return this.findPaginated(page, size, {
      where: {
        folderHierarchyId: folderId,
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
