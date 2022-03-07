import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './hn-documentation.entity';
import {HnDocumentationService} from './hn-documentation.service';
import {BlFile, BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnNodeDTO} from '../folder/hn-folder.entity';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {FlTextEditorUploadedImage} from '@monorepo/front-core-lib';

@Controller('documentation')
export class HnDocumentationController {
  constructor(private readonly documentationService: HnDocumentationService) {
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<HnDocumentationDTO[]> {
    return await this.documentationService.findAll();
  }

  @Put('content/:id')
  async updateContent(@Param('id') id: string,
                      @Body() updateContentDoc: Record<string, any>): Promise<HnDocumentation> {
    return await this.documentationService.updateContent(id, updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HnDocumentation> {
    return await this.documentationService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }

  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    return this.documentationService.update(updatedDoc);
  }

  @UseInterceptors(FilesInterceptor('file'))
  @Put('/image')
  saveImage(@UploadedFiles() files: BlFile[]): Promise<any> {
    return this.documentationService.saveImage(files);
  }

  /**
   * Return an image of the report
   */
  @Get('image/:filename')
  public async get(@Param('filename') filename: string,
                   @Res() response: Response): Promise<any> {
    const file = await this.documentationService.getImage(filename);
    file.pipe(response);
  }
}
