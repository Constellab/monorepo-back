import { BlRichTextContent } from '@monorepo/back-core-lib';

export interface CnModificationsBodyDTO{
  oldContent: BlRichTextContent;
  newContent: BlRichTextContent;
  userId: string;
  oldModifications: Record<string, any>;
}

export interface CnUndoContentBodyDTO{
  content: BlRichTextContent;
  modificationId: string;
  modifications: Record<string, any>;
}
