import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
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
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('smart-db')
export class SnSmartDbController {
  constructor(private readonly service: SnSmartDbService) {
  }

  @Post()
  async create(@Body(new BlParsePipe(SnSmartDbEntity)) smartDb: SnSmartDbEntity): Promise<SnSmartDbEntity> {
    return this.service.create(smartDb);
  }

  @Put()
  async update(@Body(new BlParsePipe(SnSmartDbEntity)) smartDb: SnSmartDbEntity): Promise<SnSmartDbEntity> {
    return this.service.update(smartDb);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.service.deleteById(id);
  }

  @Get('current')
  async getCurrentSmartDb(@Query('page', ParseIntPipe) page: number,
                          @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnSmartDbEntity>> {
    return this.service.getCurrentSmartDb(page, size);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<SnSmartDbEntity> {
    return this.service.findByIdSecure(id);
  }

  ///////////////////////////////// METHODS ON DOCS ////////////////////////////////


  @Get(':id/docs/download')
  async download(@Param('id', new ParseUUIDPipe()) id: string, @Res() response: Response): Promise<void> {
    const exportStr = JSON.stringify(await this.service.exportData(id));

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
  findNotValidates(@Param('id', new ParseUUIDPipe()) id: string,
                   @Query('page', ParseIntPipe) page: number,
                   @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocument>> {
    return this.service.findNotValidated(id, page, size);
  }

  @Get(':id/docs/:docId')
  findDocById(@Param('id', new ParseUUIDPipe()) id: string, @Param('docId') docId: string): Promise<SnDocument> {
    return this.service.findDocByIdAndCheck(id, docId);
  }

  @Put(':id/docs/validate')
  async validate(@Param('id', new ParseUUIDPipe()) id: string, @Body() doc: SnDocument): Promise<SnDocument> {
    return this.service.validateDoc(id, doc);
  }

  @Get(':id/docs/search/:search')
  search(@Param('id', new ParseUUIDPipe()) id: string, @Param('search') text: string,
         @Query('page', ParseIntPipe) page: number,
         @Query('size', ParseIntPipe) size: number): Promise<ClPageI<SnDocSearchResult>> {
    return this.service.search(id, text, page, size);
  }


  @Get(':id/docs/index')
  getIndex(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.service.getIndex(id);
  }

  @Post(':id/docs/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Param('id', new ParseUUIDPipe()) id: string, @UploadedFile() file: any): any {
    return this.service.importDataFromFile(id, file);
  }

  @Post(':id/docs/init')
  @UseInterceptors(FileInterceptor('file'))
  init(@Param('id', new ParseUUIDPipe()) id: string, @UploadedFile() file: any): any {
    return this.service.init(id, file);
  }
}
