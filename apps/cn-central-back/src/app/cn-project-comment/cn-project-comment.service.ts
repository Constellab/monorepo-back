import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {DataSource, Repository} from 'typeorm';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractService, BlFile, BlRichText, BlRichTextI, BlRichTextUploadedImage} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {CnProjectDocumentService} from '../cn-projects-aggregate/cn-project-documents/cn-project-document.service';
import {CnProjectDocumentType} from '../cn-projects-aggregate/cn-project-documents/cn-project-document.entity';

@Injectable()
export class CnProjectCommentService extends BlAbstractService<CnProjectComment> {

  protected readonly logger = new Logger(CnProjectCommentService.name);


  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              private projectDocumentService: CnProjectDocumentService,
              private datasource: DataSource) {
    super(repository, CnProjectComment);
  }

  async saveProjectCommentImage(file: BlFile, project: CnProject): Promise<BlRichTextUploadedImage> {
    return this.projectDocumentService.uploadImageDocument(file, project,
      CnProjectDocumentType.COMMENT_CONTENT, project.id);
  }

  async deleteComment(comment: CnProjectComment, projectId: string): Promise<void> {
    return this.datasource.transaction(async entityManager => {
      await this.deleteById(comment.id, entityManager);

      // delete all the images of the comment
      const richText= new BlRichText(comment.content);
      for(const image of richText.getFiguresOps()){
        const document = await this.projectDocumentService.findDocumentByProjectAndTypeAndName(
          projectId, CnProjectDocumentType.COMMENT_CONTENT, image.insert.figure.filename, projectId);

        if(document){
          await this.projectDocumentService.deleteDocument(document.id, entityManager);
        }
      }
    });
  }

  async getCommentImage(project: CnProject, documentName: string): Promise<IncomingMessage> {
    return this.projectDocumentService.getDocumentContentByTypeAndName(project, CnProjectDocumentType.COMMENT_CONTENT,
      documentName, project.id);
  }

  async createComment(newComment: CnNewComment, project: CnProject): Promise<CnProjectComment> {
    const projectComment: CnProjectComment = CnProjectComment.create(newComment, project);
    if (projectComment.isResponse) {
      projectComment.parentComment = await this.repository.findOneBy({id: newComment.parentCommentId});
    }
    return await this.create(projectComment);
  }

  async getProjectComments(projectId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    return this.findPaginated(page, size, {
      where: {
        project: {
          id: projectId
        },
        isResponse: false
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.repository.manager);
  }

  async updateComment(comment: CnProjectComment, content: BlRichTextI): Promise<CnProjectComment> {
    comment.content = BlRichText.getOptimisedContent(content);
    return await this.update(comment);
  }
}
