import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {Repository} from 'typeorm';
import {CnCommentService} from '../cn-core/services/cn-comment.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {
  BlBucketConfig,
  BlFile,
  BlObjectStorageService,
  BlRichText,
  BlRichTextI,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnProjectBucketService} from '../cn-projects-aggregate/cn-project-bucket/cn-project-bucket.service';

@Injectable()
export class CnProjectCommentService extends CnCommentService<CnProjectComment> {

  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              objectStorageService: BlObjectStorageService) {
    super(objectStorageService, repository, CnProjectComment);
  }

  async saveProjectCommentImage(file: BlFile, bucketConfig: BlBucketConfig, projectId: string): Promise<BlRichTextUploadedImage> {
    const prefix = CnProjectBucketService.getPrefix('COMMENTS', projectId);
    return this.saveImage(file, bucketConfig, prefix);
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
