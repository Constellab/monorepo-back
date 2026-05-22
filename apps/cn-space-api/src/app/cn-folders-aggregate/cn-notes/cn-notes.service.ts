import { BlAbstractService, BlBadRequestException, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import { TeRichText, TeRichTextAggregate, TeRichTextModifications } from '@monorepo/te-text-editor';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnLabConfigsService } from '../../cn-lab-configs/cn-lab-configs.service';
import { CnDocument, CnDocumentType } from '../cn-documents/cn-document.entity';
import { CnDocumentService } from '../cn-documents/cn-document.service';
import { CnDocumentUploadOverrideMode } from '../cn-documents/cn-document-dto.class';
import {
  CnHierarchyObject,
  CnHierarchyObjectEntity,
  CnHierarchyObjectVisibility,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnScenario } from '../cn-scenarios/cn-scenario.entity';
import { CnCreateNoteWithConfigDto, CnSaveNoteDto, CnSaveNoteResultDTO } from './cn-note.dto';
import {
  CnNote,
  CnNoteEntity,
  CnNoteWithDocument,
  CnNoteWithHierarchy,
  CnNoteWithLab,
  CnNoteWithScenarios,
} from './cn-note.entity';

@Injectable()
export class CnNotesService extends BlAbstractService<CnNoteEntity> {
  protected readonly logger = new Logger(CnNotesService.name);

  constructor(
    @InjectRepository(CnNoteEntity) private repository: Repository<CnNoteEntity>,
    private labConfigService: CnLabConfigsService,
    private documentService: CnDocumentService
  ) {
    super(repository, CnNoteEntity);
  }

  public findWithDocumentByIdAndCheck(id: string): Promise<CnNoteWithDocument> {
    return this.findByIdAndCheck(id, { document: true, hierarchyRepresentation: true });
  }

  public findWithLabByIdAndCheck(id: string): Promise<CnNoteWithLab> {
    return this.findByIdAndCheck(id, { lab: true, hierarchyRepresentation: true });
  }

  getNotesByRootFolderAndLab(rootFolderId: string, labId: string): Promise<CnNote[]> {
    return this.repository.find({
      where: [
        // find by folder parent root id (if note is link to leaf folder)
        {
          hierarchyRepresentation: {
            rootParentId: rootFolderId,
          },
          lab: {
            id: labId,
          },
        },
        // find by folder (if note is linked to root folder)
        {
          hierarchyRepresentation: {
            parentId: rootFolderId,
          },
          lab: {
            id: labId,
          },
        },
      ],
    });
  }

  public async getNoteContent(parentFolder: CnHierarchyObject, id: string): Promise<TeRichText> {
    const richText = await this.getNoteRichText(parentFolder, id);
    return richText.richText;
  }

  public async getNotePreviousVersion(
    parentFolder: CnHierarchyObject,
    id: string,
    modificationId: string
  ): Promise<TeRichText> {
    const richTextAggregate = await this.getNoteRichText(parentFolder, id);
    richTextAggregate.undoModifications(modificationId);
    return richTextAggregate.richText;
  }

  public async getNoteRichText(parentFolder: CnHierarchyObject, id: string): Promise<TeRichTextAggregate> {
    const note = await this.findByIdAndCheck(id, { document: true });
    const documentJson = await this.documentService.getJSONDocumentContent(
      parentFolder.getRootFolderId(),
      note.document
    );
    return TeRichTextAggregate.fromJson(documentJson);
  }

  async getFile(filename: string, parentFolder: CnHierarchyObject, noteId: string): Promise<BlFileResponse> {
    return await this.documentService.getDocumentContentByTypeAndName(
      parentFolder.getRootFolderId(),
      CnDocumentType.NOTE_CONTENT,
      filename,
      noteId
    );
  }

  async getJsonFile(
    filename: string,
    parentFolder: CnHierarchyObject,
    noteId: string
  ): Promise<BlFileResponse> {
    return await this.documentService.getDocumentContentByTypeAndName(
      parentFolder.getRootFolderId(),
      CnDocumentType.NOTE_CONTENT,
      filename + '.json',
      noteId
    );
  }

  async saveNote(
    createNoteDto: CnCreateNoteWithConfigDto,
    scenarios: CnScenario[],
    parentFolder: CnHierarchyObject,
    files: BlFile[]
  ): Promise<CnSaveNoteResultDTO> {
    let noteDb: CnNoteEntity = await this.findById(createNoteDto.note.id, {
      document: true,
      hierarchyRepresentation: true,
    });
    if (noteDb && noteDb.hierarchyRepresentation.parentId !== parentFolder.id) {
      throw new BlBadRequestException("Can't change the folder of a synced note");
    }

    // retrieve the lab config
    const labConfig = await this.labConfigService.getOrCreateLabConfig(createNoteDto.lab_config);

    // copy fields of the note DTO to note
    const noteDto: CnSaveNoteDto = createNoteDto.note;
    const note = new CnNoteEntity();

    note.id = noteDto.id;
    note.createdAt = noteDto.created_at;
    note.createdBy = noteDto.created_by;
    note.lastModifiedAt = noteDto.last_modified_at;
    note.lastModifiedBy = noteDto.last_modified_by;
    note.title = noteDto.title;

    note.labConfig = labConfig;

    // handle validated
    note.isValidated = noteDto.is_validated;
    note.validatedAt = noteDto.validated_at;
    note.validatedBy = noteDto.validated_by;

    // handle last_sync
    note.lastSyncAt = noteDto.last_sync_at;
    note.lastSyncBy = noteDto.last_sync_by;

    // if this is a creation
    if (!noteDb) {
      note.hierarchyRepresentation = CnHierarchyObjectEntity.newSubHierarchyObject(
        parentFolder,
        note.getHierarchyObjectInfo()
      );
      // also set the id of the folder hierarchy because it should be the same as the note id
      note.hierarchyRepresentation.id = noteDto.id;
    }

    let mode: 'create' | 'update';
    if (noteDb) {
      // clean associated scenarios
      note.scenarios = [];
      noteDb = await this.updateWithCompare(note, noteDb);
      // save the associated scenarios
      // we do it after the clean because if I save directly the new array, I have the error
      // DUPLICATE KEY VALUE for table note_scenarios
      if (scenarios.length > 0) {
        noteDb.scenarios = scenarios;
        noteDb = await this.repository.save(noteDb);
      }
      mode = 'update';
    } else {
      note.lab = CnCurrentUserHelper.getAndCheckCurrentLab();
      note.scenarios = scenarios;
      noteDb = await this.create(note);
      mode = 'create';
    }

    // update the content of the note
    noteDb = await this.saveNoteContent(noteDb, parentFolder, createNoteDto, files);
    return {
      mode: mode,
      note: noteDb,
    };
  }

  /**
   * Method to store the note content in the object storage. Then manage the images and the views
   */
  private async saveNoteContent(
    note: CnNoteEntity,
    parentFolder: CnHierarchyObject,
    createNoteDto: CnCreateNoteWithConfigDto,
    files: BlFile[]
  ): Promise<CnNoteEntity> {
    const richText = new TeRichText(createNoteDto.note.content);
    const modifications = TeRichTextModifications.fromJsonObject(createNoteDto.note.modifications);
    const richTextAggregate = new TeRichTextAggregate(richText, modifications);
    // const richTextAggregate = TeRichTextAggregate.fromJson(createNoteDto.note.content as any);
    let noteDocument: CnDocument;
    // if the document already exists, we update it
    if (note.document) {
      noteDocument = await this.documentService.updateJSONDocument(
        parentFolder.getRootFolderId(),
        note.document,
        richTextAggregate.toJson()
      );
    } else {
      // or use the id as doc Name
      noteDocument = await this.documentService.createJSONDocument(
        parentFolder,
        CnDocumentType.NOTE,
        note.title,
        note.id,
        richTextAggregate.toJson()
      );
    }

    // store document reference in the note
    note = await this.updatePartial(note.id, { document: noteDocument });

    // manage the file and image of the note
    await this.uploadNoteFiles(files, note.id, noteDocument, parentFolder);

    return note;
  }

  /**
   * Methode to store the images of the note in the object storage
   */
  private async uploadNoteFiles(
    files: BlFile[],
    noteId: string,
    parentDocument: CnDocument,
    parentFolder: CnHierarchyObject
  ): Promise<void> {
    if (!files) return;
    for (const file of files) {
      await this.uploadNoteFile(file, noteId, parentDocument, parentFolder);
    }
  }

  private async uploadNoteFile(
    file: BlFile,
    noteId: string,
    parentDocument: CnDocument,
    parentFolder: CnHierarchyObject
  ): Promise<void> {
    await this.documentService.uploadDocument(file, parentFolder, CnDocumentType.NOTE_CONTENT, noteId, {
      documentName: file.originalname,
      parentDocument: parentDocument,
      overrideMode: CnDocumentUploadOverrideMode.REPLACE,
    });
  }

  public async deleteNote(note: CnNoteWithDocument, entityManager: EntityManager): Promise<void> {
    if (note.isValidated) {
      throw new BlBadRequestException("Can't delete a validated note");
    }

    await this.deleteById(note.id, entityManager);

    if (note.document) {
      await this.documentService.deleteDocument(note.document.id, entityManager);
    }
  }

  findByIdAndCheckWithScenarios(id: string): Promise<CnNoteWithScenarios> {
    return this.findByIdAndCheck(id, { scenarios: true });
  }

  /**
   * Get all the notes created by the current user
   */
  public async getUserAllCreatedNotes(userId: string, spaceId: string): Promise<CnNote[]> {
    return this.repository.find({
      where: {
        createdBy: {
          id: userId,
        },
        hierarchyRepresentation: {
          spaceId: spaceId,
        },
      },
    });
  }

  public async findByLab(labId: string): Promise<CnNoteWithHierarchy[]> {
    return this.repository.find({
      where: {
        lab: {
          id: labId,
        },
        hierarchyRepresentation: {
          visibility: CnHierarchyObjectVisibility.VISIBLE,
        },
      },
      relations: {
        hierarchyRepresentation: true,
      },
    });
  }

  public async findByDocumentId(documentId: string): Promise<CnNoteWithDocument | null> {
    return this.repository.findOne({
      where: {
        document: {
          id: documentId,
        },
      },
    });
  }
}
