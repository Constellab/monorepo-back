import {
  TeRichTextBlockModification,
  TeRichTextModificationDifference,
  TeRichTextModificationType,
} from './te-rich-text-block-modification.class';
import { TeBlockType, TeBlockData } from './te-block.class';
import { TeUser } from './te-user.class';
import { DateTime } from 'luxon';
import { ClLuxonDateTimeTransform } from '@monorepo/core-lib';

export type TeRichTextGetUserFunction = (userId: string) => Promise<TeUser>;

/**
 * Modification with user information
 */
export class TeRichTextBlockModificationWithUser {
  id: string;

  @ClLuxonDateTimeTransform()
  time: DateTime;

  blockId: string;

  blockType: string;

  type: TeRichTextModificationType;

  index: number;

  userId: string;

  user: TeUser;

  differences?: TeRichTextModificationDifference[];

  blockValue?: Record<string, any>;

  oldIndex?: number;

  public static fromBlockModification(
    blockModification: TeRichTextBlockModification,
    user: TeUser
  ): TeRichTextBlockModificationWithUser {
    const modification = new TeRichTextBlockModificationWithUser();
    modification.id = blockModification.id;
    modification.time = blockModification.time;
    modification.blockId = blockModification.blockId;
    modification.blockType = blockModification.blockType;
    modification.type = blockModification.type;
    modification.index = blockModification.index;
    modification.userId = blockModification.userId;
    modification.user = user;
    modification.differences = blockModification.differences;
    modification.blockValue = blockModification.blockValue;
    modification.oldIndex = blockModification.oldIndex;
    return modification;
  }
}

export interface TeRichTextBlockModificationDTO {
  blockId: string;
  blockType: TeBlockType;
  type: TeRichTextModificationType;
  index: number;
  userId: string;
  id: string;
  time: string;
  differences?: TeRichTextModificationDifference[];
  blockValue?: TeBlockData;
  oldIndex?: number;
}

export interface TeRichTextBlockModificationsDTO {
  version: number;
  modifications: TeRichTextBlockModificationDTO[];
}
