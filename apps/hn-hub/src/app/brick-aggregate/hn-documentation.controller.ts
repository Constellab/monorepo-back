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
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './documentation/hn-documentation.entity';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlRichTextI,
  BlRichTextUploadedImage,
  BlUploadedFile
} from '@monorepo/back-core-lib';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnNodeDTO} from './folder/hn-folder.dto';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';

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
                @Body() updateContentDoc: BlRichTextI): Promise<HnDocumentation> {
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

  @Post('structure-doc-bucket')
  public async structureDocumentationBuckets(): Promise<void> {
    return await this.brickAggregateService.structureDocumentationBuckets();
  }
}
