import { BlNotUpdatable } from '@monorepo/back-core-lib';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';

import { CnMessage, CnNewMessageDTO } from '../../cn-core/model/entities/cn-message.entity';
import { CnUser, CnUserEntity } from '../../cn-users/cn-user.entity';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';

/**
 * special user for mentioning everyone
 */
export function cnGetFakeUserEveryoneMention(): CnUser {
  const user = new CnUserEntity();
  user.id = 'everyone';
  user.firstname = 'Everyone';
  user.lastname = '';
  return user;
}

@Entity('chat_message')
export class CnChatMessageEntity extends CnMessage {
  @Type(() => CnHierarchyObjectEntity)
  @ManyToOne(() => CnHierarchyObjectEntity, { nullable: false })
  @BlNotUpdatable()
  folderHierarchy: CnHierarchyObjectEntity;

  @Column({ nullable: false, update: false, length: 36 })
  folderHierarchyId: string;

  static create(newMessageDTO: CnNewMessageDTO, folderHierarchy: CnHierarchyObject): CnChatMessageEntity {
    const chatMessage: CnChatMessageEntity = new CnChatMessageEntity();
    chatMessage.content = newMessageDTO.content.toJson();
    chatMessage.folderHierarchy = folderHierarchy as CnHierarchyObjectEntity;
    chatMessage.folderHierarchyId = folderHierarchy.id;
    return chatMessage;
  }
}

export type CnChatMessage = Omit<CnChatMessageEntity, 'folderHierarchy'>;
