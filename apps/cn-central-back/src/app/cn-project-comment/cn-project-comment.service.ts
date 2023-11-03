import {Injectable, Logger} from '@nestjs/common';
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
import {CnProjectBucketService} from '../cn-projects-aggregate/cn-projects/cn-project-bucket.service';
import {IncomingMessage} from 'http';

@Injectable()
export class CnProjectCommentService extends CnCommentService<CnProjectComment> {

  protected readonly logger = new Logger(CnProjectCommentService.name);


  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              objectStorageService: BlObjectStorageService) {
    super(objectStorageService, repository, CnProjectComment);
  }

  async saveProjectCommentImage(file: BlFile, bucketConfig: BlBucketConfig[],
                                project: CnProject): Promise<BlRichTextUploadedImage> {
    const prefix = CnProjectBucketService.getPrefix(project, 'COMMENTS');
    return this.saveImage(file, bucketConfig, prefix);
  }

  async getCommentImage(project: CnProject, bucketConfig: BlBucketConfig, filename: string): Promise<IncomingMessage> {
    const prefix = CnProjectBucketService.getPrefix(project, 'COMMENTS');
    return this.getImage(filename, bucketConfig, prefix);
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

  // TODO TO REMOVE
  public async migrateComment(): Promise<void> {
    this.logger.log('Start migration of description images');

    const comments = await this.repository.find();

    for (const comment of comments) {
      let hasImage: boolean = false;
      const description = comment.content;
      if (description == null) continue;

      const content = new BlRichText(description);

      for (const image of content.getFiguresOps()) {
        if (image.insert.figure.filename.includes('/')) {
          image.insert.figure.filename = image.insert.figure.filename.split('/').pop();
          hasImage = true;
        }
      }


      if (hasImage) {
        this.logger.log('Migrate description image for project ' + comment.id);
        comment.content = content.getContent();
        await this.repository.save(comment);
      }
    }

    this.logger.log('End migration of description images');
  }

}
