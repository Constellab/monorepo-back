import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './documentation/hn-documentation.entity';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlRichTextContent,
  BlRichTextUploadedImage,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnNodeDTO} from './folder/hn-folder.dto';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {HnDocumentationFile} from './documentation-file/hn-documentation-file.entity';

@Controller('documentation')
@UseGuards(HnIsAdminGuard)
export class HnDocumentationController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {
  }

  @BlPublic()
  @Get()
  findAll(): Promise<HnDocumentationDTO[]> {
    return this.brickAggregateService.findAllDocs();
  }

  @Put('content/:id')
  updateContent(@Param('id') id: string,
                @Body() updateContentDoc: BlRichTextContent): Promise<HnDocumentation> {
    return this.brickAggregateService.updateDocContent(id, updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  findById(@Param('id') id: string): Promise<HnDocumentation> {
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
  saveImage(@BlUploadedFile() file: BlFile,
            @Param('docId', new ParseUUIDPipe()) docId: string): Promise<BlRichTextUploadedImage> {
    //TODO: Check how to secure this root
    return this.brickAggregateService.saveDocImage(file, docId);
  }

  /**
   * Return an image of the report
   */
  @BlPublic()
  @Get('image/*')
  public async get(@Req() request: Request,
                   @Res() response: Response): Promise<any> {
    const filename = request.url.split('image/')[1];
    const file = await this.brickAggregateService.getDocImage(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }

  @IsAdmin()
  @Post('migrate-docs')
  public async migrateDocumentations(): Promise<void> {
    return await this.brickAggregateService.migrateDocumentations();
  }

  ////////////////////////////////// DOC RESOURCE VIEW //////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':docId/upload-view')
  public async uploadDocResourceViewFile(@BlUploadedFile() file: BlFile,
                                           @Param('docId', new ParseUUIDPipe()) docId: string): Promise<any> {
    return {filename: await this.brickAggregateService.uploadDocResourceViewFile(docId, file)};
  }

  @BlPublic()
  @Get('view/*')
  public async getView(@Req() request: Request,
                       @Res() response: Response): Promise<any> {
    const filename = request.url.split('view/')[1];
    const file = await this.brickAggregateService.getView(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }


  /////////////////////////////////// DOC FILE //////////////////////////////////////////
  /***
   * Get doc file
   * @param docFileId
   * @param res
   */
  @BlPublic()
  @Get('get-file/:docFileId')
  public async getFile(@Param('docFileId') docFileId: string,
                       @Res({passthrough: true}) res: Response): Promise<StreamableFile> {
    const file = await this.brickAggregateService.getDocFile(docFileId);
    const fileName: string = await this.brickAggregateService.getDocFileName(docFileId);
    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return BlResponseHelper.getFileResponse(file);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:docId')
  async saveFile(@BlUploadedFile() file: BlFile,
                 @Param('docId', new ParseUUIDPipe()) docId: string): Promise<HnDocumentationFile> {
    return this.brickAggregateService.saveFile(file, docId);
  }

  @Put('file/:docFileId/rename')
  async updateStoryFile(@Param('docFileId', new ParseUUIDPipe()) docFileId: string,
                        @Body('humanName') humanName: string): Promise<HnDocumentationFile> {
    return this.brickAggregateService.renameDocFile(docFileId, humanName);
  }

  @Delete('file/:docFileId')
  async deleteDocFile(@Param('docFileId', new ParseUUIDPipe()) docFileId: string): Promise<void> {
    return this.brickAggregateService.deleteDocFile(docFileId);
  }
}
