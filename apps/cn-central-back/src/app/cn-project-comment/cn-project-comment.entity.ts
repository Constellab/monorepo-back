import {Entity, ManyToOne} from 'typeorm';
import {Type} from 'class-transformer';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnComment, CnNewCommentDTO} from '../cn-core/model/entities/cn-comment.entity';
import {CnUser} from '../cn-users/cn-user.entity';

/**
 * special user for mentioning everyone
 */
export function getFakeUserEveryoneMention(): CnUser {
  const user = new CnUser();
  user.id = 'everyone';
  user.firstname = 'Everyone';
  user.lastname = '';
  return user;
}

@Entity('project_comment')
export class CnProjectComment extends CnComment {


  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {eager: true, nullable: false, onDelete: 'CASCADE'})
  project: CnProject;

  static create(newComment: CnNewCommentDTO, project: CnProject): CnProjectComment {
    const projectComment: CnProjectComment = new CnProjectComment();
    projectComment.content = newComment.content;
    projectComment.project = project;
    return projectComment;
  }


}
