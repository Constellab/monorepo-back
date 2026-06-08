import { BlBadRequestException, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse } from '@monorepo/te-text-editor';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CnNewMessageDTO } from '../../cn-core/model/entities/cn-message.entity';
import { CnCurrentUserHelper } from '../../cn-core/utils/cn-current-user.helper';
import { CnFolderEventService } from '../cn-folder.event';
import { CnFolder } from '../cn-folders/cn-folder.entity';
import { CnFoldersService } from '../cn-folders/cn-folders.service';
import {
  CnHierarchyObjectVisibility,
  CnHierarchyObjectWithChildren,
} from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyObjectService } from '../cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnFoldersSecurityService } from '../cn-security/cn-folders-security.service';
import { CnChatMessage } from './cn-chat-message.entity';
import { CnChatMessageService } from './cn-chat-message.service';

@Injectable()
export class CnChatAggregateService {
  constructor(
    private foldersService: CnFoldersService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private securityService: CnFoldersSecurityService,
    private folderEventService: CnFolderEventService,
    private chatMessageService: CnChatMessageService,
    private datasource: DataSource
  ) {}

  async activateChat(folderId: string, enable: boolean): Promise<CnFolder> {
    await this.securityService.getAndCheckAuthorizationForUpdate(folderId);

    await this.datasource.transaction(async (entityManager) => {
      await this.foldersService.updatePartial(folderId, { chatEnabled: enable }, entityManager);
      await this.hierarchyObjectService.updatePartial(folderId, { chatEnabled: enable }, entityManager);
    });

    return this.foldersService.findByIdAndCheck(folderId);
  }

  async getChatFolders(): Promise<CnHierarchyObjectWithChildren[]> {
    const rootFolders = await this.hierarchyObjectService.getAllRootFoldersOfUser(
      CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getAndCheckCurrentSpace().id,
      CnHierarchyObjectVisibility.VISIBLE
    );

    const rootFoldersWithChildren: CnHierarchyObjectWithChildren[] = [];
    for (const rootFolder of rootFolders) {
      const rootFolderWithChild = await this.hierarchyObjectService.getFolderTreeForChat(rootFolder);
      if (rootFolderWithChild) {
        rootFoldersWithChildren.push(rootFolderWithChild);
      }
    }

    return rootFoldersWithChildren;
  }

  public async createChatMessage(newMessageDTO: CnNewMessageDTO, folderId: string): Promise<CnChatMessage> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }

    const message = await this.chatMessageService.createMessage(newMessageDTO, folder);

    this.folderEventService.emitFolderEvent({
      type: 'CREATE_FOLDER_MESSAGE',
      entity: message,
      parentFolder: folder,
    });
    return message;
  }

  public async updateChatMessage(
    folderId: string,
    messageId: string,
    messageDTO: CnNewMessageDTO
  ): Promise<CnChatMessage> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    const message = await this.chatMessageService.findByIdAndCheck(messageId);
    if (message.createdBy.id != CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new UnauthorizedException();
    }

    const newMessage = await this.chatMessageService.updateMessage(message, messageDTO.content);
    this.folderEventService.emitFolderEvent({
      type: 'UPDATE_FOLDER_MESSAGE',
      entity: message,
      parentFolder: folder,
    });
    return newMessage;
  }

  public async deleteChatMessage(folderId: string, messageId: string): Promise<void> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    const message = await this.chatMessageService.findByIdAndCheck(messageId);
    if (message.createdBy.id != CnCurrentUserHelper.getAndCheckCurrentUser().id) {
      throw new UnauthorizedException();
    }

    await this.chatMessageService.deleteMessage(message, folderId);
    this.folderEventService.emitFolderEvent({
      type: 'DELETE_FOLDER_MESSAGE',
      entity: message,
      parentFolder: folder,
    });
  }

  public async getFolderMessages(
    folderId: string,
    page: number,
    size: number
  ): Promise<ClPage<CnChatMessage>> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);

    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }

    return this.chatMessageService.getFolderMessages(folderId, page, size);
  }

  public async saveMessageImage(file: BlFile, folderId: string): Promise<TeBlockFigureUploadedResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }
    return this.chatMessageService.saveMessageImage(file, folder);
  }

  public async getMessageImage(filename: string, folderId: string): Promise<BlFileResponse> {
    const folder = await this.securityService.getAndCheckAuthorizationForFindOne(folderId);
    if (!folder.chatEnabled) {
      throw new BlBadRequestException('The chat is not enabled for this folder');
    }
    return await this.chatMessageService.getMessageImage(folder, filename);
  }
}
