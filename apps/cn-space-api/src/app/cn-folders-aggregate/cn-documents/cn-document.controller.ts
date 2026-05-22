import {
  BlFile,
  BlPublic,
  BlResponseHelper,
  BlTimeout,
  BlUploadedFile,
  BlUploadedFiles,
} from '@monorepo/back-core-lib';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Res, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnHierarchyObjectTokenDecorator } from '../cn-hierarchy-object-token/cn-hierarchy-object-token-guard.decorator';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnDocument } from './cn-document.entity';
import { CnDocumentAggregateService } from './cn-document-aggregate.service';
import {
  CnDocumentCheckSameNameRequest,
  CnDocumentCheckSameNameResponse,
  CnDocumentPreviewDTO,
  CnDocumentUploadOverrideMode,
} from './cn-document-dto.class';

@Controller('documents')
export class CnDocumentController {
  constructor(private documentAggregateService: CnDocumentAggregateService) {}

  @Post('folder/:folderId/check-same-name')
  public async checkDocumentsExistsInFolder(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Body() body: CnDocumentCheckSameNameRequest
  ): Promise<CnDocumentCheckSameNameResponse> {
    return this.documentAggregateService.checkDocumentsExistsInFolder(folderId, body);
  }

  @UseInterceptors(FileInterceptor('file'))
  // 1 minute timeout for file upload
  @BlTimeout(1 * 60 * 1000, 'File upload timed out, the upload continues in the background.')
  @Post('folder/:folderId/upload/files/:overrideMode')
  async uploadDocument(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFile() file: BlFile,
    @Param('overrideMode') overrideMode: CnDocumentUploadOverrideMode
  ): Promise<CnHierarchyObject> {
    return this.documentAggregateService.uploadDocument(folderId, file, overrideMode);
  }

  // route to upload documents from a folder
  // Limit the number of files to 1000 for now, this is also defined in the frontend
  @UseInterceptors(FilesInterceptor('file', 1000, { preservePath: true }))
  // 10 minutes timeout for folder upload
  @BlTimeout(10 * 60 * 1000, 'Folder upload timed out, the upload continues in the background.')
  @Post('folder/:folderId/upload/folder')
  async uploadFolder(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFiles() files: BlFile[]
  ): Promise<void> {
    return await this.documentAggregateService.uploadFolder(folderId, files);
  }

  /**
   * Return a document
   *
   * We create a specific endpoint to get the file from the token
   * because the token is not in the cookie so we must pass it in the url
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/preview/:filename(*)')
  public async previewDocument(
    @Param('documentId') documentId: string,
    @Param('filename') _: string,
    @Res() response: Response
  ): Promise<void> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);
    BlResponseHelper.setFileResponse(response, file, { mode: 'preview' });
  }

  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/download/:filename(*)')
  public async downloadDocument(
    @Param('documentId') documentId: string,

    @Param('filename') _: string,
    @Res() response: Response
  ): Promise<void> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);

    // use as any as this still works
    BlResponseHelper.setFileResponse(response, file);
  }

  @Put(':documentId/rename')
  public renameDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() name: { name: string }
  ): Promise<CnDocument> {
    return this.documentAggregateService.renameDocument(documentId, name.name);
  }

  ////////////////////////// DOCUMENT PREVIEW  ///////////////////////////////////////

  @CnHierarchyObjectTokenDecorator()
  @Post(':documentId/preview-token')
  public async generatePreviewToken(
    @Param('documentId', new ParseUUIDPipe()) documentId: string
  ): Promise<CnDocumentPreviewDTO> {
    return this.documentAggregateService.generatePreviewToken(documentId);
  }

  @BlPublic()
  @Get('preview/:token')
  public async getDocumentPreview(@Param('token') token: string, @Res() response: Response): Promise<any> {
    const file = await this.documentAggregateService.getDocumentByPreviewToken(token);
    BlResponseHelper.setFileResponse(response, file);
  }

  //////////////////////////////////// ADMIN //////////////////////////////////////
  @Post('sync-all-documents-tags')
  public async syncAllDocumentsTags(): Promise<void> {
    await this.documentAggregateService.syncAllDocumentsTags();
  }
}
