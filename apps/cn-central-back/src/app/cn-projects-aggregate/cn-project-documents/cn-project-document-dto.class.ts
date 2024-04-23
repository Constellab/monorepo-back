import {Type} from 'class-transformer';
import {BlBucketType, BlRichTextContent} from '@monorepo/back-core-lib';
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

export class CnStorageUsageDTO {
  totalSize: number;
  totalDocuments: number;

  constructor(totalSize: number, totalDocuments: number) {
    this.totalSize = totalSize;
    this.totalDocuments = totalDocuments;
  }
}

/**
 * Detail of the usage of a storage location
 */
export class CnStorageLocationUsageDetailDTO {

  totalSize: number = 0;
  totalDocuments: number = 0;

  details: Record<CnProjectDocumentStorageType, CnStorageUsageDTO> = {
    UPLOADED_DOCUMENT: new CnStorageUsageDTO(0, 0),
    CONSTELLAB_DOCUMENT: new CnStorageUsageDTO(0, 0),
    DESCRIPTION: new CnStorageUsageDTO(0, 0),
    REPORT: new CnStorageUsageDTO(0, 0),
    COMMENT: new CnStorageUsageDTO(0, 0)
  }

  public addDocumentSize(type: CnProjectDocumentStorageType, size: number): void {
    this.details[type].totalSize += size;
    this.details[type].totalDocuments++;
    this.totalSize += size;
    this.totalDocuments++;
  }
}

/**
 * Complete information of the usage of a storage location
 */
export class CnProjectStorageUsageDTO {
  totalSize: number = 0;
  totalDocuments: number = 0;

  cloudDetails?: CnStorageLocationUsageDetailDTO;
  dataHubDetails?: CnStorageLocationUsageDetailDTO;

  public addDocumentSize(type: CnProjectDocumentStorageType, size: number, bucketType: BlBucketType): void {
    let details = bucketType === BlBucketType.NORMAL ? this.cloudDetails : this.dataHubDetails;

    if (details == null) {
      details = new CnStorageLocationUsageDetailDTO();

      if (bucketType === BlBucketType.NORMAL) {
        this.cloudDetails = details;
      } else {
        this.dataHubDetails = details;
      }
    }
    details.addDocumentSize(type, size);

    this.totalSize += size;
    this.totalDocuments++;
  }

}
