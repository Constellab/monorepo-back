import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { BlBucketType, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Expose } from 'class-transformer';
import { DateTime } from 'luxon';
import { CnFolderObject } from '../cn-folder-hierarchies/cn-folder-object.entity';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnFolderHierarchyInfo } from '../cn-folder-hierarchies/cn-folder-hierarchy.dto';


export enum CnProjectDocumentType {
  // Uploaded document
  UPLOADED_DOCUMENT = 'UPLOADED_DOCUMENT',
  // Constellab document of a project
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  // attached image to a constellab document
  CONSTELLAB_DOCUMENT_CONTENT = 'CONSTELLAB_DOCUMENT_CONTENT',
  // attached image to a project description
  DESCRIPTION_CONTENT = 'DESCRIPTION_CONTENT',
  // contains the report
  REPORT = 'REPORT',
  // attached image and view to a report
  REPORT_CONTENT = 'REPORT_CONTENT',
  // attached images to a comment
  COMMENT_CONTENT = 'COMMENT_CONTENT'
}

/**
 * This table stores every document uploaded to the S3 server for a project
 */
@Entity('project_document')
export class CnProjectDocumentEntity extends CnFolderObject {

  // name of the document show in the interface
  @Column({ nullable: false })
  name: string;

  // name of the file in the S3 server
  @Column({ nullable: false })
  filename: string;

  @Column({ nullable: false, type: 'bigint' })
  size: number;

  @Column({ nullable: false })
  mimeType: string;

  @Column({ nullable: false, update: false, type: 'enum', enum: CnProjectDocumentType })
  type: CnProjectDocumentType;

  // The id of the entity associated with this document
  // IF type is UPLOADED_DOCUMENT,CONSTELLAB_DOCUMENT, DESCRIPTION_CONTENT or COMMENT_CONTENT, entityId is the id of the folder
  // IF type is CONSTELLAB_DOCUMENT_CONTENT, entityId is the id of the constellab document
  // IF type is REPORT or REPORT_CONTENT, entityId is the id of the report
  @Column({ nullable: false, length: 36 })
  entityId: string;

  // useful for RichText stored in documents.
  // In this case images of document has the document as parent
  @BlNotUpdatable()
  @ManyToOne(() => CnProjectDocumentEntity, { nullable: true })
  parentDocument?: CnProjectDocumentEntity;

  @Column({ nullable: false, default: false })
  inTrash: boolean;

  // TODO TO REMOVE
  @Column({ nullable: false, default: false })
  migrated: boolean;

  @Column({
    type: 'enum', enum: BlBucketType, nullable: false
  })
  bucketType: BlBucketType;

  /**
   * Preview token can be generated for a document to make it available in public route
   */
  @Exclude()
  @Column({ nullable: true, length: 36 })
  previewToken?: string;

  @Exclude()
  @BlLuxonDateTimeColumn({ nullable: true })
  previewTokenExpiration: DateTime;

  getFolderObjectInfo(): CnFolderHierarchyInfo {
    return {
      name: this.name,
      user: this.lastModifiedBy,
      lastModifiedAt: this.lastModifiedAt,
      documentSize: this.size
    };
  }

  getTypePrefix(): string {
    switch (this.type) {
      case CnProjectDocumentType.UPLOADED_DOCUMENT:
      case CnProjectDocumentType.CONSTELLAB_DOCUMENT:
        return 'documents';
      case CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT:
        return 'constellab_doc_images';
      case CnProjectDocumentType.DESCRIPTION_CONTENT:
        return 'description';
      case CnProjectDocumentType.REPORT:
      case CnProjectDocumentType.REPORT_CONTENT:
        return 'report_contents';
      case CnProjectDocumentType.COMMENT_CONTENT:
        return 'comments';
    }
  }

  documentTypeSupportsTrash(): boolean {
    // the trash is only supported for uploaded documents and constellab documents
    return this.type === CnProjectDocumentType.UPLOADED_DOCUMENT
      || this.type === CnProjectDocumentType.CONSTELLAB_DOCUMENT;
  }

  /**
   * Return true if this document supports preview in the Iframe
   */
  @Expose()
  get canTokenPreview(): boolean {
    const officesMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/msword', // doc
      'application/vnd.ms-excel', // xls
      'application/vnd.ms-powerpoint' // ppt
    ];
    return this.type === CnProjectDocumentType.UPLOADED_DOCUMENT && officesMimeTypes.includes(this.mimeType);
  }

  @BeforeInsert()
  setCreatedInfo(): void {
    this.createdBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.createdAt = ClDateHelper.getDate();
  }

  @BeforeInsert()
  @BeforeUpdate()
  setLastModifiedInfo(): void {
    this.lastModifiedBy = CnCurrentUserHelper.getAndCheckCurrentUser();
    this.lastModifiedAt = ClDateHelper.getDate();
  }
}

export type CnProjectDocument = Omit<CnProjectDocumentEntity, 'folderHierarchy' | 'parentDocument'>;

export type CnProjectDocumentWithHierarchy = Omit<CnProjectDocumentEntity, 'parentDocument'>;
