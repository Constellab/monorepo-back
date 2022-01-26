import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocSearchResult, SnDocument} from './model/sn-document.class';
import {SnDocService} from './service/sn-doc.service';
import {SnDataImporterService} from './service/sn-data-importer.service';
import {Response} from 'express';

@Controller('smart-db/doc')
export class SnDocController {
  constructor(private readonly docService: SnDocService,
              private dataImporter: SnDataImporterService) {
  }

  @Get('download')
  async download(@Res() response: Response): Promise<void> {
    const exportStr = JSON.stringify(await this.docService.exportData());

    // create a file to be downloaded
    //tell the browser to download this
    response.setHeader('Content-disposition', 'attachment; filename=smartdb.json');
    response.setHeader('Content-type', 'application/json');

    //convert to a buffer and send to client
    const fileContents = Buffer.from(exportStr, 'utf-8');

    // send file to download
    response.send(fileContents);
  }

  @Get('not-validated')
  findNotValidates(@Query('page', ParseIntPipe) page: number,
                   @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocument>> {
    return this.docService.findNotValidated(page, size);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<SnDocument> {
    return this.docService.findByIdAndCheck(id);
  }

  @Put('validate')
  async validate(@Body() doc: SnDocument): Promise<SnDocument> {
    return this.docService.validateDoc(doc);
  }

  @Get('/search/:search')
  search(@Param('search') text: string,
         @Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docService.search(text, page, size);
  }

  @Post('add-mapping')
  addMapping(): Promise<any> {
    return this.docService.createIndex();
  }

  @Get('index')
  getIndexes(): Promise<any> {
    return this.docService.getIndex();
  }

  @Get('index/:name')
  getIndex(@Param('name') name: string): Promise<any> {
    return this.docService.getIndex(name);
  }

  @Delete('index')
  deleteIndexes(): Promise<any> {
    return this.docService.deleteIndex();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any): any {
    return this.dataImporter.importDataFromFile(file);
  }

  @Post('init')
  @UseInterceptors(FileInterceptor('file'))
  init(@UploadedFile() file: any): any {
    return this.docService.init(file);
  }
}
