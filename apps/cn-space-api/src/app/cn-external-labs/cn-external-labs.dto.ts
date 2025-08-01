import { TeRichTextBlockModificationsDTO, TeRichTextDTO } from '@monorepo/te-text-editor';

import { CnTag } from '../cn-folders-aggregate/cn-hierarchy-object-tags/cn-hierarchy-object-tag.dto';

export interface CnRichTextCompareRequestDTO {
  version: number;
  oldContent: TeRichTextDTO;
  newContent: TeRichTextDTO;
  userId: string;
  oldModifications: TeRichTextBlockModificationsDTO;
}

export interface CnRichTextUndoRequestDTO {
  version: number;
  content: TeRichTextDTO;
  modificationId: string;
  modifications: TeRichTextBlockModificationsDTO;
}

export interface CnExternalLabTagsDTO {
  tags: CnTag[];
}
