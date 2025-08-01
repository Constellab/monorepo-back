import { BlFile, BlResponseHelper, BlUploadedFile } from '@monorepo/back-core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichText,
  TeRichTextBlockModificationWithUser,
  TeRichTextDTO,
  TeRichTextPipe,
} from '@monorepo/te-text-editor';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Res, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnHierarchyObjectTokenDecorator } from '../cn-hierarchy-object-token/cn-hierarchy-object-token-guard.decorator';
import { CnConstellabDocumentAggregateService } from './cn-constellab-document.aggregate.service';
import { CnDocument } from './cn-document.entity';
import { CnConstellabDocumentDTO } from './cn-document-dto.class';

@Controller('constellab-documents')
export class CnConstellabDocumentController {
  constructor(private constellabDocumentAggregateService: CnConstellabDocumentAggregateService) {}

  @Post('folder/:folderId')
  public createConstellabDocument(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Body() name: { name: string }
  ): Promise<CnConstellabDocumentDTO> {
    return this.constellabDocumentAggregateService.createConstellabDocument(folderId, name.name);
  }

  @Put(':documentId')
  public updateConstellabDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body(TeRichTextPipe) richText: TeRichText
  ): Promise<CnConstellabDocumentDTO> {
    return this.constellabDocumentAggregateService.updateConstellabDocument(documentId, richText);
  }

  // check if the user can edit (is no other user is editing the document)
  @Get(':documentId/check-edit')
  public checkEditConstellabDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<void> {
    return this.constellabDocumentAggregateService.checkEditConstellabDocument(documentId);
  }

  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId')
  public getConstellabDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<CnConstellabDocumentDTO> {
    return this.constellabDocumentAggregateService.getConstellabDocument(documentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':documentId/image')
  async uploadImageToConstellabDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.constellabDocumentAggregateService.uploadImageToConstellabDocument(documentId, file);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':documentId/file')
  async uploadFileToConstellabDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<TeBlockFileUploadResponse> {
    return this.constellabDocumentAggregateService.uploadFileToConstellabDocument(documentId, file);
  }

  /**
   * We create a specific endpoint to get the file from the token
   * because the token is not in the cookie so we must pass it in the url
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/file/:documentName(*)')
  public async getConstellabDocumentImage(
    @Param('documentId') documentId: string,
    @Param('documentName') documentName: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.constellabDocumentAggregateService.getConstellabDocumentContentDocument(
      documentId,
      documentName
    );
    BlResponseHelper.setFileResponse(response, file, 'preview');
  }

  /////////////////////////////// History ///////////////////////////////////////////
  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/history')
  async getDocumentModifications(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    return this.constellabDocumentAggregateService.getConstellabDocumentModifications(documentId);
  }

  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/history/undo-content/:modificationId')
  async undoContent(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<TeRichTextDTO> {
    const richText = await this.constellabDocumentAggregateService.getConstellabDocumentationUndoContent(
      documentId,
      modificationId
    );
    return richText.toJson();
  }

  @Put(':documentId/history/rollback/:modificationId')
  async rollbackContent(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<CnDocument> {
    return this.constellabDocumentAggregateService.rollbackContent(documentId, modificationId);
  }
}
