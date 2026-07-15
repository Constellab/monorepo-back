import { BlBucketType, BlFileHelper, BlLuxonDateTimeColumn, BlNotUpdatable } from '@monorepo/back-core-lib';
import { ClDateHelper, ClStringHelper } from '@monorepo/core-lib';
import { Exclude, Expose } from 'class-transformer';
import { DateTime } from 'luxon';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

import { CnTypeStyle } from '../../cn-core/model/config/cn-type-style.class';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnHierarchyObjectInfo } from '../cn-hierarchy-objects/cn-hierarchy-object.dto';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectType,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyRepresentation } from '../cn-hierarchy-objects/cn-hierarchy-representation';

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
  name!: string;

  // name of the file in the S3 server
  @Exclude()
  @Column({ nullable: false })
  filename!: string;

  @Column({ nullable: false, type: 'bigint' })
  size!: number;

  @Column({ nullable: false })
  mimeType!: string;

  @Column({ nullable: false, update: false, type: 'enum', enum: CnDocumentType })
  type!: CnDocumentType;

  // The id of the entity associated with this document
  // IF type is UPLOADED_DOCUMENT,CONSTELLAB_DOCUMENT, DESCRIPTION_CONTENT
  // or MESSAGE_CONTENT, entityId is the id of the folder
  // IF type is CONSTELLAB_DOCUMENT_CONTENT, entityId is the id of the constellab document
  // IF type is NOTE or NOTE_CONTENT, entityId is the id of the note
  @Column({ nullable: false, length: 36 })
  entityId!: string;

  // useful for RichText stored in documents.
  // In this case images of document has the document as parent
  @BlNotUpdatable()
  @ManyToOne(() => CnDocumentEntity, { nullable: true })
  parentDocument!: CnDocument | null;

  // Use to differentiate between the different types of bucket
  // to calculate storage
  @Column({
    type: 'enum',
    enum: BlBucketType,
    nullable: false,
  })
  bucketType!: BlBucketType;

  /**
   * Preview token can be generated for a document to make it available in public route
   */
  @Exclude()
  @Column({ nullable: true, type: 'varchar', length: 36 })
  previewToken!: string | null;

  @Exclude()
  @BlLuxonDateTimeColumn({ nullable: true })
  previewTokenExpiration: DateTime | null = null;

  @Column({ nullable: false, type: 'simple-json' })
  style!: CnTypeStyle;

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
      style: this.style,
    };
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

  getNameWithExtension(): string {
    return BlFileHelper.getFilenameWithoutExtension(this.name) + '.' + this.getExtension();
  }

  getExtension(): string {
    return BlFileHelper.getFileExtension(this.filename);
  }

  isImage(): boolean {
    return this.mimeType.startsWith('image/');
  }

  isVideo(): boolean {
    return this.mimeType.startsWith('video/');
  }

  isAudio(): boolean {
    return this.mimeType.startsWith('audio/');
  }

  public static newDocument(
    name: string,
    filename: string,
    size: number,
    mimeType: string,
    type: CnDocumentType,
    entityId: string,
    bucketType: BlBucketType,
    parentFolder: CnHierarchyObject,
    parentDocument?: CnDocument
  ): CnDocumentEntity {
    const document = new CnDocumentEntity();
    document.name = ClStringHelper.removeNonVisibleCharacters(name);
    document.filename = filename;
    document.size = size;
    document.mimeType = mimeType;
    document.type = type;
    document.entityId = entityId;
    document.bucketType = bucketType;
    document.style = document.buildStyle();
    document.parentDocument = parentDocument ?? null;
    document.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
      parentFolder,
      document.getHierarchyObjectInfo()
    );
    return document;
  }

  public buildStyle(): CnTypeStyle {
    if (this.type === CnDocumentType.UPLOADED_DOCUMENT) {
      return {
        icon_type: 'MATERIAL_ICON',
        icon_technical_name: this.getFileIconFromExtension(),
      };
    } else if (this.type === CnDocumentType.CONSTELLAB_DOCUMENT) {
      return {
        icon_type: 'MATERIAL_ICON',
        icon_technical_name: 'constellab_document',
      };
    } else {
      return {
        icon_type: 'MATERIAL_ICON',
        icon_technical_name: 'insert_drive_file',
      };
    }
  }

  private getFileIconFromExtension(): string {
    if (this.isImage()) {
      return 'image';
    }

    if (this.isVideo()) {
      return 'smart_display';
    }

    const extension = this.getExtension();
    if (!extension) return 'insert_drive_file';

    switch (extension.toLowerCase()) {
      case 'csv':
      case 'xls':
      case 'xlsx':
        return 'csv_file_icon';
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'image';
      case 'mp3':
      case 'wav':
      case 'flac':
      case 'aac':
      case 'ogg':
      case 'wma':
      case 'm4a':
      case 'aiff':
      case 'alac':
        return 'audiotrack';
      case 'txt':
        return 'txt_file_icon';
      case 'pdf':
        return 'pdf_file_icon';
      case 'doc':
      case 'docx':
        return 'docx_file_icon';
      case 'json':
        return 'json_file_icon';
      case 'ppt':
      case 'pptx':
        return 'pptx_file_icon';
      case 'zip':
        return 'zip_file_icon';
      case 'py':
        return 'py_file_icon';
      default:
        return 'insert_drive_file';
    }
  }
}

export type CnDocument = Omit<CnDocumentEntity, 'hierarchyRepresentation' | 'parentDocument'>;

export type CnDocumentWithHierarchy = Omit<CnDocumentEntity, 'parentDocument'>;
