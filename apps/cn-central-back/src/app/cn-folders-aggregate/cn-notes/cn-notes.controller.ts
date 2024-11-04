import { Controller, Delete, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { CnNote } from './cn-note.entity';
import { Response } from 'express';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { BlResponseHelper, BlRichTextBlockModificationDto, BlRichTextContent } from '@monorepo/back-core-lib';

@Controller('notes')
export class CnNotesController {

  constructor(private folderAggregateService: CnFolderAggregateService) {
  }

  @Get(':id/content')
  async getNoteContent(@Param('id', new ParseUUIDPipe()) id: string): Promise<BlRichTextContent> {
    return await this.folderAggregateService.findNoteContent(id);
  }

  @Get(':id')
  async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnNote> {
    return await this.folderAggregateService.findNote(id);
  }


  @Get('scenario/:scenarioId')
  async getNotesByScenario(@Param('scenarioId', new ParseUUIDPipe()) scenarioId: string): Promise<CnNote[]> {
    return await this.folderAggregateService.getNoteAssociatedToScenario(scenarioId);
  }

  /**
   * Return a file (file or image) of the note
   * Use filename(*) to catch all the filename (including slashes)
   */
  @Get(':id/file/:filename(*)')
  public async getImage(@Param('id', new ParseUUIDPipe()) id: string,
                        @Param('filename') filename: string,
                        @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getNoteFile(id, filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  /**
   * Return a view of the note
   */
  @Get(':id/view/:viewId')
  public async getView(@Param('id', new ParseUUIDPipe()) id: string,
                       @Param('viewId') viewId: string,
                       @Res() response: Response): Promise<any> {
    const file = await this.folderAggregateService.getNoteView(id, viewId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Delete(':id')
  public async deleteNote(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.folderAggregateService.deleteNote(id);
  }

  /////////////////////////////////////////////// HISTORY ///////////////////////////////////////////////
  @Get(':noteId/history')
  async getNoteModifications(
    @Param('noteId', new ParseUUIDPipe()) noteId: string
  ): Promise<BlRichTextBlockModificationDto[]> {
    return this.folderAggregateService.getNoteModifications(noteId);
  }

  @Get(':noteId/history/undo-content/:modificationId')
  async undoContent(
    @Param('noteId', new ParseUUIDPipe()) noteId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<Record<string, any>> {
    return this.folderAggregateService.getNoteUndoContent(noteId, modificationId);
  }

}
