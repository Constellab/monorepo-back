import { Column, Entity, ManyToOne } from 'typeorm';
import { Type } from 'class-transformer';
import { CnComment, CnNewCommentDTO } from '../cn-core/model/entities/cn-comment.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity
} from '../cn-projects-aggregate/cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { BlNotUpdatable } from '@monorepo/back-core-lib';

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

  @Type(() => CnFolderHierarchyEntity)
  @ManyToOne(() => CnFolderHierarchyEntity, {nullable: false})
  @BlNotUpdatable()
  folderHierarchy: CnFolderHierarchyEntity;

  @Column({nullable: false, update: false})
  folderHierarchyId: string;

  static create(newComment: CnNewCommentDTO, folderHierarchy: CnFolderHierarchy): CnProjectComment {
    const projectComment: CnProjectComment = new CnProjectComment();
    projectComment.content = newComment.content;
    projectComment.folderHierarchy = folderHierarchy as CnFolderHierarchyEntity;
    projectComment.folderHierarchyId = folderHierarchy.id;
    return projectComment;
  }


}
