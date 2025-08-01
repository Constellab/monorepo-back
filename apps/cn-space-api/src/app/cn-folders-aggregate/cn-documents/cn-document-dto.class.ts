import { BlBucketType } from '@monorepo/back-core-lib';
import { TeRichTextDTO } from '@monorepo/te-text-editor';
import { Type } from 'class-transformer';

import { CnDocument, CnDocumentEntity } from './cn-document.entity';

export class CnConstellabDocumentDTO {
  @Type(() => CnDocumentEntity)
  document: CnDocument;

  content: TeRichTextDTO;

  constructor(document: CnDocument, content: TeRichTextDTO) {
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
    let details = bucketType === BlBucketType.LAB ? this.dataHubDetails : this.cloudDetails;

    if (details == null) {
      details = new CnStorageLocationUsageDetailDTO();

      if (bucketType === BlBucketType.LAB) {
        this.dataHubDetails = details;
      } else {
        this.cloudDetails = details;
      }
    }
    details.addDocumentSize(type, size);

    this.totalSize += size;
    this.totalDocuments++;
  }
}

export class CnDocumentPreviewDTO {
  @Type(() => CnDocumentEntity)
  document: CnDocument;

  previewUrl: string;

  constructor(document: CnDocument, previewUrl: string) {
    this.document = document;
    this.previewUrl = previewUrl;
  }
}

export enum CnDocumentUploadOverrideMode {
  IGNORE = 'IGNORE', // ignore the new document if it already exists
  ERROR = 'ERROR', // throw an error if the document already exists
  REPLACE = 'REPLACE', // replace the existing document with the new one
  RENAME = 'RENAME', // rename the new document with '_1' if it already exists
}

export interface CnDocumentCheckSameNameRequest {
  names: string[];
}

export interface CnDocumentCheckSameNameResponse {
  folderHasFileWithSameName: boolean;
}
