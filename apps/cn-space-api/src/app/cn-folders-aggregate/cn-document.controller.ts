import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { CnDocumentAggregateService } from './cn-document-aggregate.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BlFile, BlPublic, BlResponseHelper, BlUploadedFile, BlUploadedFiles } from '@monorepo/back-core-lib';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnDocument } from './cn-documents/cn-document.entity';
import { CnDocumentPreviewDTO } from './cn-documents/cn-document-dto.class';
import { Response } from 'express';

@Controller('documents')
export class CnDocumentController {
  constructor(private documentAggregateService: CnDocumentAggregateService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post('folder/:folderId')
  async uploadDocument(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<CnHierarchyObject> {
    return this.documentAggregateService.uploadDocument(folderId, file);
  }

  // route to upload documents from a folder
  @UseInterceptors(FilesInterceptor('files', 1000, { preservePath: true }))
  @Post('folder/:folderId')
  async uploadFolder(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFiles() files: BlFile[]
  ): Promise<void> {
    return await this.documentAggregateService.uploadFolder(folderId, files);
  }

  /**
   * Return a document
   */
  @Get(':documentId/preview/:filename(*)')
  public async previewDocument(
    @Param('documentId') documentId: string,
    @Param('filename') _: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);
    BlResponseHelper.setFileResponse(response, file);
  }

  @Get(':documentId/download/:filename(*)')
  public async downloadDocument(
    @Param('documentId') documentId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param('filename') _: string
  ): Promise<StreamableFile> {
    const file = await this.documentAggregateService.getUploadedDocument(documentId);

    // use as any as this still works
    return BlResponseHelper.getFileResponse(file.file as any);
  }

  @Put(':documentId/rename')
  public renameDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() name: { name: string }
  ): Promise<CnDocument> {
    return this.documentAggregateService.renameDocument(documentId, name.name);
  }

  ////////////////////////// DOCUMENT PREVIEW  ///////////////////////////////////////

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
}
