import {
  BlRichTextBlockModification,
  BlRichTextModificationDifference,
  BlRichTextModificationType
} from './bl-rich-text-block-modification.class';
import {BlUserDto} from './bl-user/bl-user.class';

export class BlRichTextBlockModificationDto {
  id: string;

  time: number;

  blockId: string;

  blockType: string;

  type: BlRichTextModificationType;

  index: number;

  userId: string;

  user: BlUserDto;

  differences?: BlRichTextModificationDifference[];

  blockValue?: Record<string, any>

  oldIndex?: number;

  constructor(blockModification: BlRichTextBlockModification, user: BlUserDto) {
    this.id = blockModification.id;
    this.time = blockModification.time;
    this.blockId = blockModification.blockId;
    this.blockType = blockModification.blockType;
    this.type = blockModification.type;
    this.index = blockModification.index;
    this.userId = blockModification.userId;
    this.user = user;
    this.differences = blockModification.differences;
    this.blockValue = blockModification.blockValue;
    this.oldIndex = blockModification.oldIndex;
  }
}
