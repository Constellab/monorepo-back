import { BlResponseHelper } from '@monorepo/back-core-lib';
import { TeRichTextBlockModificationWithUser, TeRichTextDTO } from '@monorepo/te-text-editor';
import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';

import { CnLabMinimumDTO } from '../../cn-labs/cn-lab.dto';
import { CnHierarchyObjectTokenDecorator } from '../cn-hierarchy-object-token/cn-hierarchy-object-token-guard.decorator';
import { CnNote } from './cn-note.entity';
import { CnNoteAggregateService } from './cn-note-aggregate.service';

@Controller('notes')
export class CnNotesController {
  constructor(private noteAggregateService: CnNoteAggregateService) {}

  @CnHierarchyObjectTokenDecorator()
  @Get(':id/content')
  async getNoteContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<TeRichTextDTO> {
    const richText = await this.noteAggregateService.findNoteContent(id);
    return richText.toJson();
  }

  @CnHierarchyObjectTokenDecorator()
  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnNote> {
    return await this.noteAggregateService.findNote(id);
  }

  @Get('scenario/:scenarioId')
  async getNotesByScenario(@Param('scenarioId', new ParseUUIDPipe()) scenarioId: string): Promise<CnNote[]> {
    return await this.noteAggregateService.getNoteAssociatedToScenario(scenarioId);
  }

  /**
   * Return a file (file or image) of the note
   * Use filename(*) to catch all the filename (including slashes)
   *
   * We create a specific endpoint to get the file from the token
   * because the token is not in the cookie so we must pass it in the url
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':id/file/*filename')
  public async getImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('filename') filename: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.noteAggregateService.getNoteFile(id, filename);
    if (file) {
      BlResponseHelper.setFileResponseAndCache(response, file, { filename });
    } else {
      response.status(404).send('File not found');
    }
  }

  /**
   * Return the content of a json file of the note
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':id/json-file/:filename')
  public async getNoteJsonFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('filename') filename: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.noteAggregateService.getNoteJsonFile(id, filename);
    if (file) {
      BlResponseHelper.setFileResponse(response, file);
    } else {
      response.status(404).send('File not found');
    }
  }

  @Get(':id/lab')
  async getNoteLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabMinimumDTO> {
    return this.noteAggregateService.getNoteLab(id);
  }

  /////////////////////////////////////////////// HISTORY ///////////////////////////////////////////////
  @CnHierarchyObjectTokenDecorator()
  @Get(':noteId/history')
  async getNoteModifications(
    @Param('noteId', new ParseUUIDPipe()) noteId: string
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    return this.noteAggregateService.getNoteModifications(noteId);
  }

  @Get(':noteId/history/undo-content/:modificationId')
  async undoContent(
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<Record<string, any>> {
    return this.noteAggregateService.getNoteUndoContent(noteId, modificationId);
  }
}
