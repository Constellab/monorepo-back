import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { BlBucketType, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { Exclude, Expose } from 'class-transformer';
import { DateTime } from 'luxon';
import { CnHierarchyRepresentation } from '../cn_hierarchy_objects/cn-hierarchy-representation';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { ClDateHelper } from '@monorepo/core-lib';
import { CnHierarchyObjectInfo } from '../cn_hierarchy_objects/cn-hierarchy-object.dto';
import { CnHierarchyObjectType } from '../cn_hierarchy_objects/cn-hierarchy-object.entity';

export enum CnDocumentType {
  // Uploaded document
  UPLOADED_DOCUMENT = 'UPLOADED_DOCUMENT',
  // Constellab document
  CONSTELLAB_DOCUMENT = 'CONSTELLAB_DOCUMENT',
  // attached image to a constellab document
  CONSTELLAB_DOCUMENT_CONTENT = 'CONSTELLAB_DOCUMENT_CONTENT',
  // attached image to a folder description
  DESCRIPTION_CONTENT = 'DESCRIPTION_CONTENT',
  // contains the note
  NOTE = 'NOTE',
  // attached image and view to a note
  NOTE_CONTENT = 'NOTE_CONTENT',
  // attached images to a message
  MESSAGE_CONTENT = 'MESSAGE_CONTENT',
}

/**
 * This table stores every document uploaded to the S3 server for a folder
 */
@Entity('document')
export class CnDocumentEntity extends CnHierarchyRepresentation {
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

  @Column({ nullable: false, update: false, type: 'enum', enum: CnDocumentType })
  type: CnDocumentType;

  // The id of the entity associated with this document
  // IF type is UPLOADED_DOCUMENT,CONSTELLAB_DOCUMENT, DESCRIPTION_CONTENT or MESSAGE_CONTENT, entityId is the id of the folder
  // IF type is CONSTELLAB_DOCUMENT_CONTENT, entityId is the id of the constellab document
  // IF type is NOTE or NOTE_CONTENT, entityId is the id of the note
  @Column({ nullable: false, length: 36 })
  entityId: string;

  // useful for RichText stored in documents.
  // In this case images of document has the document as parent
  @BlNotUpdatable()
  @ManyToOne(() => CnDocumentEntity, { nullable: true })
  parentDocument?: CnDocumentEntity;

  @Column({ nullable: false, default: false })
  inTrash: boolean;

  @Column({
    type: 'enum',
    enum: BlBucketType,
    nullable: false,
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

  getHierarchyObjectInfo(): CnHierarchyObjectInfo {
    let objectType: CnHierarchyObjectType;
    if (this.type === CnDocumentType.UPLOADED_DOCUMENT) {
      objectType = CnHierarchyObjectType.DOCUMENT;
    } else if (this.type === CnDocumentType.CONSTELLAB_DOCUMENT) {
      objectType = CnHierarchyObjectType.CONSTELLAB_DOCUMENT;
    } else {
      objectType = CnHierarchyObjectType.HIDDEN_DOCUMENT;
    }
    return {
      objectType: objectType,
      name: this.name,
      user: this.lastModifiedBy ?? CnCurrentUserHelper.getAndCheckCurrentUser(),
      lastModifiedAt: this.lastModifiedAt ?? ClDateHelper.getDate(),
      documentSize: this.size,
      // the object is visible in the hierarchy only if it's an uploaded document or a constellab document
      // and it is not in the trash
      isVisible:
        [CnDocumentType.UPLOADED_DOCUMENT, CnDocumentType.CONSTELLAB_DOCUMENT].includes(this.type) &&
        !this.inTrash,
    };
  }

  getTypePrefix(): string {
    switch (this.type) {
      case CnDocumentType.UPLOADED_DOCUMENT:
      case CnDocumentType.CONSTELLAB_DOCUMENT:
        return 'documents';
      case CnDocumentType.CONSTELLAB_DOCUMENT_CONTENT:
        return 'constellab_doc_images';
      case CnDocumentType.DESCRIPTION_CONTENT:
        return 'description';
      case CnDocumentType.NOTE:
      case CnDocumentType.NOTE_CONTENT:
        return 'report_contents';
      case CnDocumentType.MESSAGE_CONTENT:
        return 'comments';
    }
  }

  documentTypeSupportsTrash(): boolean {
    // the trash is only supported for uploaded documents and constellab documents
    return this.type === CnDocumentType.UPLOADED_DOCUMENT || this.type === CnDocumentType.CONSTELLAB_DOCUMENT;
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
      'application/vnd.ms-powerpoint', // ppt
    ];
    return this.type === CnDocumentType.UPLOADED_DOCUMENT && officesMimeTypes.includes(this.mimeType);
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

export type CnDocument = Omit<CnDocumentEntity, 'hierarchyRepresentation' | 'parentDocument'>;

export type CnDocumentWithHierarchy = Omit<CnDocumentEntity, 'parentDocument'>;
