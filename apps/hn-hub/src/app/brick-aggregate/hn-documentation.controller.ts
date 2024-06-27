import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './documentation/hn-documentation.entity';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import {FileInterceptor} from '@nestjs/platform-express';
import {HnNodeDTO} from './folder/hn-folder.dto';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {HnDocumentationDto} from './documentation/hn-documentation.dto';
import {HnAbstractFileController} from '../file-aggregate/file-core/hn-abstract-file.controller';
import {HnFileDocumentationService} from '../file-aggregate/file-documentation/hn-file-documentation.service';
import {HnUploadFileResponseDto} from '../file-aggregate/file-core/hn-abstract-file.dto';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';

@Controller('documentation')
@UseGuards(HnIsAdminGuard)
export class HnDocumentationController extends HnAbstractFileController<HnDocumentation> {
  constructor(private readonly brickAggregateService: HnBrickAggregateService,
              private readonly fileDocumentationService: HnFileDocumentationService) {
    super(fileDocumentationService);
  }

  @IsAdmin()
  @Get('bucket-items')
  async getAllBucketItemsName(): Promise<any> {
    return this.brickAggregateService.migrateDocBucketItemsName();
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
  @Post('complete-path')
  findByCompletePath(@Body() body: any): Promise<HnDocumentationDto> {
    return this.brickAggregateService.findCurrentDoc(body.brickName, body.version, body.completePath);
  }

  @BlPublic()
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
  saveImage(@BlUploadedFile() file: BlFile,
            @Param('docId', new ParseUUIDPipe()) docId: string): Promise<BlRichTextUploadedImageResponse> {
    return this.brickAggregateService.saveDocImage(file, docId);
  }


  ////////////////////////////////// DOC RESOURCE VIEW //////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post(':docId/upload-view')
  public async saveResourceViewFile(@BlUploadedFile() file: BlFile,
                                           @Param('docId', new ParseUUIDPipe()) docId: string): Promise<any> {
    return {filename: await this.brickAggregateService.saveDocResourceViewFile(docId, file)};
  }



  /////////////////////////////////// DOC FILE //////////////////////////////////////////
  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:docId')
  async saveFile(@BlUploadedFile() file: BlFile,
                 @Param('docId', new ParseUUIDPipe()) docId: string): Promise<HnUploadFileResponseDto> {
    return this.brickAggregateService.saveFile(file, docId);
  }

}
