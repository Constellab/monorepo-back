import { Injectable } from '@nestjs/common';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnFolderEventService } from '../cn-folder.event';
import { DataSource } from 'typeorm';
import { CnNotesService } from './cn-notes.service';
import { CnNote, CnNoteWithDocument, CnNoteWithLab } from './cn-note.entity';
import { TeRichText, TeRichTextBlockModificationWithUser } from '@monorepo/te-text-editor';
import { CnCreateNoteWithConfigDto } from './cn-note.dto';
import { BlBadRequestException, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import { CnScenario } from '../cn-scenarios/cn-scenario.entity';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnScenariosService } from '../cn-scenarios/cn-scenarios.service';
import { CnDocumentService } from '../cn-documents/cn-document.service';
import { CnUsersService } from '../../cn-users/cn-users.service';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnExternalLabSyncedObjectDTO } from '../../cn-external-lab-api/model/cn-external-lab-api.class';
import { CnLabMinimumDTO } from '../../cn-labs/cn-lab.dto';

@Injectable()
export class CnNoteAggregateService {
  constructor(
    private noteService: CnNotesService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private scenarioService: CnScenariosService,
    private documentService: CnDocumentService,
    private userService: CnUsersService,
    private eventService: CnFolderEventService,
    private datasource: DataSource
  ) {}

  public async findNote(id: string): Promise<CnNote> {
    await this.securityService.getAndCheckAuthorizationForFindOne(id);
    return await this.noteService.findByIdAndCheck(id);
  }

  public async findNoteContent(id: string): Promise<TeRichText> {
    const noteFolder = await this.securityService.getAndCheckAuthorizationForFindOne(id);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return await this.noteService.getNoteContent(parentFolder, id);
  }

  async createLabNote(
    createNoteDto: CnCreateNoteWithConfigDto,
    parentFolderId: string,
    files: BlFile[]
  ): Promise<void> {
    const parentFolder = await this.securityService.getAndCheckAuthorizationForUpdate(parentFolderId);

    // get and check all scenario
    const scenarios: CnScenario[] = [];
    for (const scenarioId of createNoteDto.scenario_ids) {
      const scenario = await this.scenarioService.findScenarioWithHierarchyById(scenarioId);

      if (scenario == null) {
        throw new BlBadRequestException(
          "Can't create the note because one of the linked scenario could not be found"
        );
      }

      if (scenario.hierarchyRepresentation.getRootFolderId() !== parentFolder.getRootFolderId()) {
        throw new BlBadRequestException(
          "Can't create the note because it is linked to an scenario of another root folder"
        );
      }
      scenarios.push(scenario);
    }

    const noteResult = await this.noteService.saveNote(createNoteDto, scenarios, parentFolder, files);

    if (noteResult.mode === 'create') {
      this.eventService.emitFolderEvent('CREATE_NOTE', parentFolder, noteResult.note);
    } else {
      this.eventService.emitFolderEvent('UPDATE_NOTE', parentFolder, noteResult.note);
    }
  }

  async deleteNote(noteId: string): Promise<boolean> {
    const note = await this.noteService.findWithDocumentByIdAndCheck(noteId);
    if (!note) {
      return false;
    }

    await this.datasource.transaction(async (entityManager) => {
      await this.noteService.deleteNote(note, entityManager);
      await this.hierarchyObjectService.deleteById(noteId, entityManager);
    });
    return true;
  }

  async getNoteAssociatedToScenario(scenarioId: string): Promise<CnNote[]> {
    await this.securityService.getAndCheckAuthorizationForFindOne(scenarioId);

    return (await this.scenarioService.findByIdAndCheckWithNotes(scenarioId)).notes;
  }

  async getNoteFile(noteId: string, filename: string): Promise<BlFileResponse> {
    const noteFolder = await this.securityService.getAndCheckAuthorizationForFindOne(noteId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return this.noteService.getFile(filename, parentFolder, noteId);
  }

  async getNoteView(noteId: string, viewId: string): Promise<BlFileResponse> {
    const noteFolder = await this.securityService.getAndCheckAuthorizationForFindOne(noteId);
    const parentFolder = await this.hierarchyObjectService.findByIdAndCheck(noteFolder.parentId);
    return this.noteService.getView(viewId, parentFolder, noteId);
  }

  public getNotesByRootFolderAndLab(rootFolderId: string, labId: string): Promise<CnNote[]> {
    return this.noteService.getNotesByRootFolderAndLab(rootFolderId, labId);
  }

  public async moveNoteToFolder(
    noteHierarchyObject: CnHierarchyObject,
    newParentFolder: CnHierarchyObject
  ): Promise<CnHierarchyObject> {
    const note: CnNoteWithDocument = await this.noteService.findWithDocumentByIdAndCheck(
      noteHierarchyObject.id
    );
    const document = await this.documentService.findWithHierarchyByIdAndCheck(note.document.id);

    // move the document
    // no transaction because move document can be long
    await this.documentService.moveDocument(document, note.hierarchyRepresentation, newParentFolder);

    // update the note parent folder
    return await this.hierarchyObjectService.updateLeafParent(
      note.hierarchyRepresentation.id,
      newParentFolder
    );
  }

  public async getNotesOfCurrentLab(): Promise<CnExternalLabSyncedObjectDTO[]> {
    const notes = await this.noteService.findByLab(CnCurrentUserHelper.getAndCheckCurrentLab().id);

    return notes.map((note) => {
      return new CnExternalLabSyncedObjectDTO(
        note.id,
        note.hierarchyRepresentation.parentId,
        note.lastSyncAt,
        note.lastSyncBy.id
      );
    });
  }

  public async getNoteSyncLabDTO(noteId: string): Promise<CnNoteWithLab> {
    return this.noteService.findWithLabByIdAndCheck(noteId);
  }

  public async getNoteLab(noteId: string): Promise<CnLabMinimumDTO> {
    await this.securityService.getAndCheckAuthorizationForFindOne(noteId);
    const note = await this.noteService.findWithLabByIdAndCheck(noteId);
    return {
      id: note.lab.id,
      name: note.lab.name,
      isFreeLab: note.lab.isFreeLab,
      type: note.lab.type,
    };
  }

  ////////////////////////////// HISTORY ///////////////////////
  public async getNoteModifications(noteId: string): Promise<TeRichTextBlockModificationWithUser[]> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(noteId);

    await this.noteService.findByIdAndCheck(noteId);

    const richTextAggregate = await this.noteService.getNoteRichText(folder, noteId);
    return richTextAggregate.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  public async getNoteUndoContent(noteId: string, modificationId: string): Promise<TeRichText> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(noteId);
    await this.noteService.findByIdAndCheck(noteId);
    return await this.noteService.getNotePreviousVersion(folder, noteId, modificationId);
  }
}
