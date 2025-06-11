import { BlFile, BlPublic, BlResponseHelper, BlUploadedFile, BlUploadedFiles } from '@monorepo/back-core-lib';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Res, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CnHierarchyObjectTokenDecorator } from '../cn-hierarchy-object-token/cn-hierarchy-object-token-guard.decorator';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnDocumentAggregateService } from './cn-document-aggregate.service';
import {
  CnDocumentCheckSameNameRequest,
  CnDocumentCheckSameNameResponse,
  CnDocumentPreviewDTO,
  CnDocumentUploadOverrideMode,
} from './cn-document-dto.class';
import { CnDocument } from './cn-document.entity';

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
  @Post('folder/:folderId/upload/files/:overrideMode')
  async uploadDocument(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFile() file: BlFile,
    @Param('overrideMode') overrideMode: CnDocumentUploadOverrideMode
  ): Promise<CnHierarchyObject> {
    return this.documentAggregateService.uploadDocument(folderId, file, overrideMode);
  }

  // route to upload documents from a folder
  @UseInterceptors(FilesInterceptor('file', 1000, { preservePath: true }))
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
    BlResponseHelper.setFileResponse(response, file, 'preview');
  }

  @CnHierarchyObjectTokenDecorator()
  @Get(':documentId/download/:filename(*)')
  public async downloadDocument(
    @Param('documentId') documentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('filename') _: string,
    @Res() response: Response
  ): Promise<void> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);

    // use as any as this still works
    BlResponseHelper.setFileResponse(response, file, 'download');
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
    BlResponseHelper.setFileResponse(response, file, 'download');
  }
}
