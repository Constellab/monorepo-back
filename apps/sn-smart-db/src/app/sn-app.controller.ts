import {Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors} from '@nestjs/common';

import {SnAppService} from './sn-app.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {SnDataImporterService} from './sn-data-importer.service';

@Controller('app')
export class SnAppController {
  constructor(private readonly appService: SnAppService,
              private dataImporter: SnDataImporterService) {
  }


  @Get('/search/:search')
  search(@Param('search') text: string): Promise<any> {
    return this.appService.search(text);
  }

  @Post('add-mapping')
  addMapping(): Promise<any> {
    return this.appService.addMapping();
  }

  @Get('index')
  getIndexes(): Promise<any> {
    return this.appService.getIndex();
  }

  @Get('index/:name')
  getIndex(@Param('name') name: string): Promise<any> {
    return this.appService.getIndex(name);
  }

  @Delete('index/:name')
  deleteIndexes(@Param('name') name: string): Promise<any> {
    return this.appService.deleteIndex(name);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any): any {
    return this.dataImporter.uploadDataFromFile(file);
  }

  @Post('read-csv')
  @UseInterceptors(FileInterceptor('file'))
  readCsv(@UploadedFile() file: any): any {
    return this.dataImporter.readDataFromCsv(file);
  }

}
