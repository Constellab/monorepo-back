import { BlDtoHelper, BlFile, BlParsePipe, BlResponseHelper, BlUploadedFile } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse } from '@monorepo/te-text-editor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { CnNewMessageDTO } from '../../cn-core/model/entities/cn-message.entity';
import { CnChatFolderDTO } from '../cn-folders/cn-folder.dto';
import { CnFolder } from '../cn-folders/cn-folder.entity';
import { CnChatAggregateService } from './cn-chat-aggregate.service';
import { CnChatMessageDto } from './cn-chat-message.dto';

@Controller('chat')
export class CnChatController {
  constructor(private chatAggregateService: CnChatAggregateService) {}

  @Get('folder-tree')
  async getChatFolders(): Promise<CnChatFolderDTO[]> {
    const folders = await this.chatAggregateService.getChatFolders();
    return folders.map((folder) => new CnChatFolderDTO(folder));
  }

  @Put('folder/:folderId/activate/:enabled')
  activateChat(
    @Param('folderId', ParseUUIDPipe) folderId: string,
    @Param('enabled', ParseBoolPipe) enabled: boolean
  ): Promise<CnFolder> {
    return this.chatAggregateService.activateChat(folderId, enabled);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('folder/:folderId/message/image')
  saveMessageImage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.chatAggregateService.saveMessageImage(file, folderId);
  }

  /**
   * Return an image of a message
   * Use documentName(*) to catch all the documentName (including slashes)
   */
  @Get('folder/:folderId/message/image/:documentName(*)')
  public async getMessageImage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Param('documentName') documentName: string,
    @Res() response: Response
  ): Promise<any> {
    const file = await this.chatAggregateService.getMessageImage(documentName, folderId);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Post('folder/:folderId/message')
  async createFolderMessage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Body(new BlParsePipe(CnNewMessageDTO)) newMessageDTO: CnNewMessageDTO
  ): Promise<CnChatMessageDto> {
    const message = await this.chatAggregateService.createChatMessage(newMessageDTO, folderId);
    return new CnChatMessageDto(message);
  }

  @Put('folder/:folderId/message/:messageId')
  async updateFolderMessage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @Body(new BlParsePipe(CnNewMessageDTO)) newMessageDTO: CnNewMessageDTO
  ): Promise<CnChatMessageDto> {
    const message = await this.chatAggregateService.updateChatMessage(folderId, messageId, newMessageDTO);
    return new CnChatMessageDto(message);
  }

  @Get('folder/:folderId/message')
  async getFolderMessages(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<CnChatMessageDto>> {
    const result = await this.chatAggregateService.getFolderMessages(folderId, page, size);
    return BlDtoHelper.pageToDto(CnChatMessageDto, result);
  }

  @Delete('folder/:folderId/message/:messageId/delete')
  deleteFolderMessage(
    @Param('folderId', new ParseUUIDPipe()) folderId: string,
    @Param('messageId', new ParseUUIDPipe()) messageId: string
  ): Promise<void> {
    return this.chatAggregateService.deleteChatMessage(folderId, messageId);
  }
}
