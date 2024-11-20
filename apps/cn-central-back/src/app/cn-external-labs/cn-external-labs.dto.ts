import { TeRichTextBlockModificationsDTO, TeRichTextDTO } from '@monorepo/te-text-editor';

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
