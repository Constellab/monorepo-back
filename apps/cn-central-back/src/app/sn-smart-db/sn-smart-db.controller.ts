import {
  Body,
  Controller,
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
import {Response} from 'express';
import {SnSmartDbService} from './service/sn-smart-db.service';
import {SnDocSearchResult, SnDocument} from './model/sn-document.class';
import {SnSmartDbEntity} from './model/sn-smart-db.entity';

@Controller('smart-db')
export class SnSmartDbController {
  constructor(private readonly docService: SnSmartDbService) {
  }

  @Get('current')
  async getCurrentSmartDb(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnSmartDbEntity>> {
    return this.docService.getCurrentSmartDb(page, size);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<SnSmartDbEntity> {
    return this.docService.findByIdSecure(id);
  }

  ///////////////////////////////// METHODS ON DOCS ////////////////////////////////


  @Get(':id/docs/download')
  async download(@Param('id') id: string, @Res() response: Response): Promise<void> {
    const exportStr = JSON.stringify(await this.docService.exportData(id));

    // create a file to be downloaded
    //tell the browser to download this
    response.setHeader('Content-disposition', 'attachment; filename=smartdb.json');
    response.setHeader('Content-type', 'application/json');

    //convert to a buffer and send to client
    const fileContents = Buffer.from(exportStr, 'utf-8');

    // send file to download
    response.send(fileContents);
  }

  @Get(':id/docs/not-validated')
  findNotValidates(@Param('id') id: string,
                   @Query('page', ParseIntPipe) page: number,
                   @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocument>> {
    return this.docService.findNotValidated(id, page, size);
  }

  @Get(':id/docs/:docId')
  findDocById(@Param('id') id: string, @Param('docId') docId: string): Promise<SnDocument> {
    return this.docService.findDocByIdAndCheck(id, docId);
  }

  @Put(':id/docs/validate')
  async validate(@Param('id') id: string, @Body() doc: SnDocument): Promise<SnDocument> {
    return this.docService.validateDoc(id, doc);
  }

  @Get(':id/docs/search/:search')
  search(@Param('id') id: string, @Param('search') text: string,
         @Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.docService.search(id, text, page, size);
  }


  @Get(':id/docs/index')
  getIndex(@Param('id') id: string): Promise<any> {
    return this.docService.getIndex(id);
  }

  @Post(':id/docs/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Param('id') id: string, @UploadedFile() file: any): any {
    return this.docService.importDataFromFile(id, file);
  }

  @Post(':id/docs/init')
  @UseInterceptors(FileInterceptor('file'))
  init(@Param('id') id: string, @UploadedFile() file: any): any {
    return this.docService.init(id, file);
  }
}
