import {Body, Controller, Delete, Get, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './documentation/hn-documentation.entity';
import {BlFile, BlParsePipe, BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {FileInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnNodeDTO} from './folder/hn-folder.dto';
import {CmRichTextI, CmRichTextUploadedImage} from '@monorepo/common-model';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
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

  @IsAdmin()
  @Put('content/:id')
  updateContent(@Param('id') id: string,
                      @Body() updateContentDoc: CmRichTextI): Promise<HnDocumentation> {
    return this.brickAggregateService.updateDocContent(id, updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  findById(@Param('id') id: string): Promise<HnDocumentation> {
    return this.brickAggregateService.findDocById(id);
  }

  @IsAdmin()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.brickAggregateService.removeDoc(id);
  }

  @IsAdmin()
  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    return this.brickAggregateService.updateDoc(updatedDoc);
  }

  @IsAdmin()
  @UseInterceptors(FileInterceptor('file'))
  @Put('/image')
  saveImage(@UploadedFile() file: BlFile): Promise<CmRichTextUploadedImage> {
    return this.brickAggregateService.saveDocImage(file);
  }

  /**
   * Return an image of the report
   */
  @BlPublic()
  @Get('image/:filename')
  public async get(@Param('filename') filename: string,
                   @Res() response: Response): Promise<any> {
    const file = await this.brickAggregateService.getDocImage(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }
}
