import {Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors} from '@nestjs/common';

import {FileInterceptor} from '@nestjs/platform-express';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocSearchResult} from './model/sn-document.class';
import {SnDocService} from './service/sn-doc.service';
import {SnDataImporterService} from './service/sn-data-importer.service';

@Controller('smart-db/doc')
export class SnDocController {
  constructor(private readonly appService: SnDocService,
              private dataImporter: SnDataImporterService) {
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<SnDocSearchResult> {
    return this.appService.findByIdAndCheck(id);
  }


  @Get('/search/:search')
  search(@Param('search') text: string,
         @Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.appService.search(text, page, size);
  }

  @Post('add-mapping')
  addMapping(): Promise<any> {
    return this.appService.createIndex();
  }

  @Get('index')
  getIndexes(): Promise<any> {
    return this.appService.getIndex();
  }

  @Get('index/:name')
  getIndex(@Param('name') name: string): Promise<any> {
    return this.appService.getIndex(name);
  }

  @Delete('index')
  deleteIndexes(): Promise<any> {
    return this.appService.deleteIndex();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any): any {
    return this.dataImporter.importDataFromFile(file);
  }

  @Post('read-csv')
  @UseInterceptors(FileInterceptor('file'))
  readCsv(@UploadedFile() file: any): any {
    return this.dataImporter.readDataFromCsv(file);
  }

  @Post('init')
  @UseInterceptors(FileInterceptor('file'))
  init(@UploadedFile() file: any): any {
    return this.appService.init(file);
  }
}
