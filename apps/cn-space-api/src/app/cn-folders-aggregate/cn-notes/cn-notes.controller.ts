import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { CnNote } from './cn-note.entity';
import { Response } from 'express';
import { BlResponseHelper } from '@monorepo/back-core-lib';
import { TeRichTextBlockModificationWithUser, TeRichTextDTO } from '@monorepo/te-text-editor';
import { CnNoteAggregateService } from '../cn-note-aggregate.service';
import { CnLabMinimumDTO } from '../../cn-labs/cn-lab.dto';

@Controller('notes')
export class CnNotesController {
  constructor(private noteAggregateService: CnNoteAggregateService) {}

  @Get(':id/content')
  async getNoteContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<TeRichTextDTO> {
    const richText = await this.noteAggregateService.findNoteContent(id);
    return richText.toJson();
  }

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
   */
  @Get(':id/file/:filename(*)')
  public async getImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('filename') filename: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.noteAggregateService.getNoteFile(id, filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /**
   * Return a view of the note
   */
  @Get(':id/view/:viewId')
  public async getView(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('viewId') viewId: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.noteAggregateService.getNoteView(id, viewId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Get(':id/lab')
  async getNoteLab(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnLabMinimumDTO> {
    return this.noteAggregateService.getNoteLab(id);
  }

  /////////////////////////////////////////////// HISTORY ///////////////////////////////////////////////
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
