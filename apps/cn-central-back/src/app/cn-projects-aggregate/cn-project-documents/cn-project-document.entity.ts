import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import {CnBaseEntity} from '../../cn-core/model/entities/cn-base.entity';
import {BlNotUpdatable} from '@monorepo/back-core-lib';
import {Type} from 'class-transformer';
import {CnProject} from '../cn-projects/cn-project.entity';


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
  REPORT = "REPORT",
  // attached image and view to a report
  REPORT_CONTENT = 'REPORT_CONTENT',
  // attached images to a comment
  COMMENT_CONTENT = 'COMMENT_CONTENT'
}

/**
 * This table stores every document uploaded to the S3 server for a project
 */
@Entity('project_document')
@Unique(['projectId', 'type', 'name'])
export class CnProjectDocument extends CnBaseEntity {

  // name of the document show in the interface
  @Column({nullable: false})
  name: string;

  // name of the file in the S3 server
  @Column({nullable: false})
  filename: string;

  @Column({nullable: false})
  size: number;

  @Column({nullable: false})
  mimeType: string;

  @BlNotUpdatable()
  @Type(() => CnProject)
  @ManyToOne(() => CnProject, {nullable: false})
  project: CnProject;

  @Column()
  projectId: string;

  @Column({nullable: false, update: false, type: 'enum', enum: CnProjectDocumentType})
  type: CnProjectDocumentType;

  // The id of the entity associated with this document
  // IF type is UPLOADED_DOCUMENT,CONSTELLAB_DOCUMENT, DESCRIPTION_CONTENT or COMMENT_CONTENT, entityId is the id of the project
  // IF type is CONSTELLAB_DOCUMENT_CONTENT, entityId is the id of the constellab document
  // IF type is REPORT or REPORT_CONTENT, entityId is the id of the report
  @Column({nullable: false, update: false, length: 36})
  entityId: string;

  // useful for RichText stored in documents.
  // In this case images of document has the document as parent
  @BlNotUpdatable()
  @ManyToOne(() => CnProjectDocument, {nullable: true})
  parentDocument?: CnProjectDocument;

  @Column({nullable: false, default: false})
  inTrash: boolean;

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
}
