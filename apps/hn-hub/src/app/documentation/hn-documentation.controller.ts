import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {HnDocumentation, HnDocumentationDTO} from './hn-documentation.entity';
import {HnDocumentationService} from './hn-documentation.service';
import {BlFile, BlParsePipe, BlPublic, BlResponseHelper} from '@monorepo/back-core-lib';
import {FilesInterceptor} from '@nestjs/platform-express';
import {Response} from 'express';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {CmRichTextI} from '@monorepo/common-model';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';

@Controller('documentation')
@UseGuards(HnIsAdminGuard)
export class HnDocumentationController {
  constructor(private readonly documentationService: HnDocumentationService) {
  }

  @BlPublic()
  @Get()
  async findAll(): Promise<HnDocumentationDTO[]> {
    const docs: HnDocumentation[] = await this.documentationService.findAll();
    const docsDto: HnDocumentationDTO[] = [];
    docs.map((doc) => {
      if (!doc.path.includes('/')) {
        docsDto.push(new HnDocumentationDTO(doc));
      }
    })
    return docsDto;
  }

  @IsAdmin()
  @Put('content/:id')
  async updateContent(@Param('id') id: string,
                      @Body() updateContentDoc: CmRichTextI): Promise<HnDocumentation> {
    return await this.documentationService.updateContent(id, updateContentDoc);
  }

  @BlPublic()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HnDocumentation> {
    return await this.documentationService.findOne(id);
  }

  @IsAdmin()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentationService.remove(id);
  }

  @IsAdmin()
  @Put()
  update(@Body(new BlParsePipe(HnNodeDTO)) updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    return this.documentationService.update(updatedDoc);
  }

  @IsAdmin()
  @UseInterceptors(FilesInterceptor('file'))
  @Put('/image')
  saveImage(@UploadedFiles() files: BlFile[]): Promise<any> {
    return this.documentationService.saveImage(files);
  }

  /**
   * Return an image of the report
   */
  @BlPublic()
  @Get('image/:filename')
  public async get(@Param('filename') filename: string,
                   @Res() response: Response): Promise<any> {
    const file = await this.documentationService.getImage(filename);
    BlResponseHelper.setMessageAndCache(response, file);
  }
}
