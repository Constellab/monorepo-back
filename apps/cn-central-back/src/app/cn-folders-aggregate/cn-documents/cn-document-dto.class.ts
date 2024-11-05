import { Type } from 'class-transformer';
import { BlBucketType, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnDocument, CnDocumentEntity } from './cn-document.entity';

export class CnConstellabDocumentDTO {
  @Type(() => CnDocumentEntity)
  document: CnDocument;

  content: BlRichTextContent;

  constructor(document: CnDocument, content: BlRichTextContent) {
    this.document = document;
    this.content = content;
  }
}

export enum CnDocumentStorageType {
  UPLOADED_DOCUMENT = 'UPLOADED_DOCUMENT',
  DESCRIPTION = 'DESCRIPTION',
  NOTE = 'NOTE',
  MESSAGE = 'MESSAGE',
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

  details: Record<CnDocumentStorageType, CnStorageUsageDTO> = {
    UPLOADED_DOCUMENT: new CnStorageUsageDTO(0, 0),
    DESCRIPTION: new CnStorageUsageDTO(0, 0),
    NOTE: new CnStorageUsageDTO(0, 0),
    MESSAGE: new CnStorageUsageDTO(0, 0),
  };

  public addDocumentSize(type: CnDocumentStorageType, size: number): void {
    this.details[type].totalSize += size;
    this.details[type].totalDocuments++;
    this.totalSize += size;
    this.totalDocuments++;
  }
}

/**
 * Complete information of the usage of a storage location
 */
export class CnFolderStorageUsageDTO {
  totalSize: number = 0;
  totalDocuments: number = 0;

  cloudDetails?: CnStorageLocationUsageDetailDTO;
  dataHubDetails?: CnStorageLocationUsageDetailDTO;

  public addDocumentSize(type: CnDocumentStorageType, size: number, bucketType: BlBucketType): void {
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

export class CnDocumentPreviewDTO {
  previewUrl: string;

  constructor(previewUrl: string) {
    this.previewUrl = previewUrl;
  }
}
