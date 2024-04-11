import {Entity, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnComment, CnNewComment} from '../cn-core/model/entities/cn-comment.entity';

@Entity('project_comment')
export class CnProjectComment extends CnComment {


  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {eager: true,nullable: false, onDelete: 'CASCADE'})
  project: CnProject;

  static create(newComment: CnNewComment, project: CnProject): CnProjectComment {
    const projectComment: CnProjectComment = new CnProjectComment();
    projectComment.init(newComment);
    projectComment.project = project;
    return projectComment;
  }


}
