import {
  BlFile,
  BlOptionalAuth,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeRichText,
  TeRichTextBlockModificationWithUser,
  TeRichTextDTO,
  TeRichTextPipe,
} from '@monorepo/te-text-editor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import {
  HnAbstractFileEntityDTO,
  HnUploadFileResponseDto,
} from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileDocumentationService } from '../file-aggregate/file-documentation/hn-file-documentation.service';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import { HnDocumentation, HnDocumentationDTO } from './documentation/hn-documentation.entity';
import { HnNodeDTO } from './folder/hn-folder.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

@Controller('documentation')
@UseGuards(HnIsAdminGuard)
export class HnDocumentationController extends HnAbstractFileController<HnDocumentation> {
  constructor(
    private readonly brickAggregateService: HnBrickAggregateService,
    readonly fileDocumentationService: HnFileDocumentationService
  ) {
    super(fileDocumentationService);
  }

  @BlOptionalAuth()
  @Get()
  findAll(): Promise<HnDocumentationDTO[]> {
    return this.brickAggregateService.findAllDocs();
  }

  @Put('content/:id')
  updateContent(
    @Param('id') id: string,
    @Body(TeRichTextPipe) updateContentDoc: TeRichText
  ): Promise<HnDocumentation> {
    return this.brickAggregateService.updateDocContent(id, updateContentDoc);
  }

  @BlOptionalAuth()
  @Post('complete-path')
  findByCompletePath(@Body() body: any): Promise<HnDocumentationDto> {
    return this.brickAggregateService.findCurrentDoc(body.brickName, body.version, body.completePath);
  }

  @BlOptionalAuth()
  @Get(':id')
  findById(@Param('id') id: string): Promise<HnDocumentationDto> {
    return this.brickAggregateService.findDocById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.brickAggregateService.removeDoc(id);
  }

  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    return this.brickAggregateService.updateDoc(updatedDoc);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('/image/:docId')
  saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('docId', new ParseUUIDPipe()) docId: string
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.brickAggregateService.saveDocImage(file, docId);
  }

  ///////////////////////////////////////// HISTORY /////////////////////////////////////////

  @Get('history/:docId')
  async getDocModifications(
    @Param('docId', new ParseUUIDPipe()) docId: string
  ): Promise<TeRichTextBlockModificationWithUser[]> {
    return this.brickAggregateService.getDocModifications(docId);
  }

  @Get('history/undo-content/:docId/:modificationId')
  async testUndo(
    @Param('docId', new ParseUUIDPipe()) docId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<TeRichTextDTO> {
    const richText = await this.brickAggregateService.getUndoContent(docId, modificationId);
    return richText.richText.toJson();
  }

  @Put('history/rollback/:docId/:modificationId')
  async rollbackContent(
    @Param('docId', new ParseUUIDPipe()) docId: string,
    @Param('modificationId', new ParseUUIDPipe()) modificationId: string
  ): Promise<HnDocumentation> {
    return this.brickAggregateService.rollbackContent(docId, modificationId);
  }

  ////////////////////////////////// DOC RESOURCE VIEW //////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':docId/upload-view')
  public async saveResourceViewFile(
    @BlUploadedFile() file: BlFile,
    @Param('docId', new ParseUUIDPipe()) docId: string
  ): Promise<any> {
    return {
      filename: await this.brickAggregateService.saveDocResourceViewFile(docId, file),
    };
  }

  /////////////////////////////////// DOC FILE //////////////////////////////////////////

  @BlOptionalAuth()
  @Get('doc-files/:docId')
  async getDocFiles(@Param('docId', new ParseUUIDPipe()) docId: string): Promise<HnAbstractFileEntityDTO[]> {
    return this.brickAggregateService.getDocFiles(docId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:docId')
  async saveFile(
    @BlUploadedFile() file: BlFile,
    @Param('docId', new ParseUUIDPipe()) docId: string
  ): Promise<HnUploadFileResponseDto> {
    return this.brickAggregateService.saveFile(file, docId);
  }

  ///////////////////////////////////// OTHER METHODS //////////////////////////////////////
  @BlPublic()
  @Get('download-doc-markdown/:docId')
  async downloadDocMarkdown(
    @Param('docId', new ParseUUIDPipe()) docId: string,
    @Res() res: Response
  ): Promise<any> {
    const md = await this.brickAggregateService.downloadDocMarkdown(docId);
    res.set({
      'Content-Disposition': `attachment; filename="${md.name}"`,
    });
    BlResponseHelper.setFileResponse(res, md);
  }

  @BlPublic()
  @Get('download-tech-doc-markdown/:techDocType/:techDocId')
  async downloadTechnicalDocMarkdown(
    @Param('techDocType') techDocType: string,
    @Param('techDocId', new ParseUUIDPipe()) techDocId: string,
    @Res() res: Response
  ): Promise<any> {
    const md = await this.brickAggregateService.downloadTechnicalDocMarkdown(techDocType, techDocId);
    res.set({
      'Content-Disposition': `attachment; filename="${md.name}"`,
    });
    BlResponseHelper.setFileResponse(res, md);
  }
}
