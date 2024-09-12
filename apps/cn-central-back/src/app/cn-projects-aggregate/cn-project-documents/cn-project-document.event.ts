import { CnProjectDocument } from './cn-project-document.entity';

export const cnProjectDocumentEventName = 'cn-project-document-event';

export type CnProjectDocumentEventType =
  'CREATE_DOCUMENT' | 'UPDATE_DOCUMENT' | 'DELETE_DOCUMENT';

export interface CnProjectDocumentEvent {
  type: CnProjectDocumentEventType;
  entity: CnProjectDocument;
  spaceId: string;
}
