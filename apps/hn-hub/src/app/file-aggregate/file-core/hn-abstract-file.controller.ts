import {
  BlEntityWithId,
  BlFile,
  BlPublic,
  BlResponseHelper,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse,
} from '@monorepo/back-core-lib';
import { HnAbstractFileService } from './hn-abstract-file.service';
import { Body, Delete, Get, Param, ParseUUIDPipe, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { HnAbstractFileEntityDTO } from './hn-abstract-file.dto';

export abstract class HnAbstractFileController<T extends BlEntityWithId> {
  fileService: HnAbstractFileService<T>;

  protected constructor(_abstractFileService: HnAbstractFileService<T>) {
    this.fileService = _abstractFileService;
  }

  /**
   * Get file by fileId
   * @param entityId
   * @param fileName
   * @param res
   * @return file
   */
  @BlPublic()
  @Get([':entityId/file/:fileName', ':entityId/image/:fileName', ':entityId/view/:fileName'])
  public async getFile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response
  ): Promise<any> {
    const file = await this.fileService.getFile(entityId, fileName);
    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    BlResponseHelper.setFileResponse(res, file);
  }

  //-------------------------------------------- FILE --------------------------------------------
  /**
   * Rename file by fileId
   * @param fileId
   * @param humanName
   * @return fileEntity
   */
  @Put('file/:fileId/rename')
  async renameFile(
    @Param('fileId', new ParseUUIDPipe()) fileId: string,
    @Body('humanName') humanName: string
  ): Promise<HnAbstractFileEntityDTO> {
    return this.fileService.renameFile(fileId, humanName);
  }

  /**
   * Delete file by fileId
   * @param entityId
   * @param name
   */
  @Delete(':entityId/file/:name')
  async deleteFile(
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Param('name', new ParseUUIDPipe()) name: string
  ): Promise<void> {
    return this.fileService.deleteFile(entityId, name);
  }

  abstract saveFile(file: BlFile, entityId: string): Promise<BlRichTextUploadFileResponse>;

  //-------------------------------------------- IMAGE --------------------------------------------
  abstract saveImage(file: BlFile, entityId: string): Promise<BlRichTextUploadedImageResponse>;

  //-------------------------------------------- RESOURCE VIEW --------------------------------------------
  abstract saveResourceViewFile(file: BlFile, entityId: string): Promise<any>;
}
