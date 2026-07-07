import { CnDocument } from './cn-document.entity';

export const CN_DOCUMENT_EVENT_NAME = 'cn-document-event';

export type CnDocumentEventType = 'CREATE_DOCUMENT' | 'UPDATE_DOCUMENT' | 'DELETE_DOCUMENT';

export interface CnDocumentEvent {
  type: CnDocumentEventType;
  entity: CnDocument;
  spaceId: string;
}
