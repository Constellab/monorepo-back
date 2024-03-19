import {Type} from 'class-transformer';
import {BlRichTextContent} from '@monorepo/back-core-lib';
import {CnProjectDocument} from './cn-project-document.entity';

export class CnConstellabDocumentDTO {
  @Type(() => CnProjectDocument)
  document: CnProjectDocument;

  content: BlRichTextContent;

  constructor(document: CnProjectDocument, content: BlRichTextContent) {
    this.document = document;
    this.content = content;
  }
}

export enum CnProjectDocumentStorageType {
  UPLOADED_DOCUMENT = 'UPLOADED_DOCUMENT',
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  DESCRIPTION = 'DESCRIPTION',
  REPORT = 'REPORT',
  COMMENT = 'COMMENT'
}

export class CnProjectStorageUsageDetailDTO {
  totalSize: number;

  totalDocuments: number;

  constructor(totalSize: number, totalDocuments: number) {
    this.totalSize = totalSize;
    this.totalDocuments = totalDocuments;
  }
}

export class CnProjectStorageUsageDTO extends CnProjectStorageUsageDetailDTO {
  details: Record<CnProjectDocumentStorageType, CnProjectStorageUsageDetailDTO>;

  constructor(totalSize: number, totalDocuments: number) {
    super(totalSize, totalDocuments);
    this.details = {
      UPLOADED_DOCUMENT: new CnProjectStorageUsageDetailDTO(0, 0),
      CONSTELLAB_DOCUMENT: new CnProjectStorageUsageDetailDTO(0, 0),
      DESCRIPTION: new CnProjectStorageUsageDetailDTO(0, 0),
      REPORT: new CnProjectStorageUsageDetailDTO(0, 0),
      COMMENT: new CnProjectStorageUsageDetailDTO(0, 0)
    };
  }

}
