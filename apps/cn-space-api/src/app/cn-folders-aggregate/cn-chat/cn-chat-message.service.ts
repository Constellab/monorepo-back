import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CnChatMessage, CnChatMessageEntity } from './cn-chat-message.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CnNewMessageDTO } from '../../cn-core/model/entities/cn-message.entity';
import { ClPage } from '@monorepo/core-lib';
import { BlAbstractService, BlFile, BlFileResponse } from '@monorepo/back-core-lib';
import { CnDocumentService } from '../cn-documents/cn-document.service';
import { CnDocumentType } from '../cn-documents/cn-document.entity';
import { CnHierarchyObject } from '../cn-hierarchy-objects/cn-hierarchy-object.entity';
import { TeBlockFigureUploadedResponse, TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class CnChatMessageService extends BlAbstractService<CnChatMessageEntity> {
  protected readonly logger = new Logger(CnChatMessageService.name);

  constructor(
    @InjectRepository(CnChatMessageEntity) private repository: Repository<CnChatMessageEntity>,
    private documentService: CnDocumentService,
    private datasource: DataSource
  ) {
    super(repository, CnChatMessageEntity);
  }

  async deleteMessage(message: CnChatMessage, folderId: string): Promise<void> {
    return this.datasource.transaction(async (entityManager) => {
      await this.deleteById(message.id, entityManager);

      // delete all the images of the message
      const richText = message.getRichTextContent();
      for (const image of richText.getFiguresBlocks()) {
        const document = await this.documentService.findDocumentByTypeAndNameAndEntity(
          CnDocumentType.MESSAGE_CONTENT,
          image.data.filename,
          folderId
        );

        if (document) {
          await this.documentService.deleteDocument(document.id, entityManager);
        }
      }
    });
  }

  async getMessageImage(folder: CnHierarchyObject, documentName: string): Promise<BlFileResponse> {
    return this.documentService.getDocumentContentByTypeAndName(
      folder.getRootFolderId(),
      CnDocumentType.MESSAGE_CONTENT,
      documentName,
      folder.id
    );
  }

  async createMessage(newMessageDTO: CnNewMessageDTO, folder: CnHierarchyObject): Promise<CnChatMessage> {
    const messageEntity: CnChatMessageEntity = CnChatMessageEntity.create(newMessageDTO, folder);
    return await this.create(messageEntity);
  }

  async getFolderMessages(folderId: string, page: number, size: number): Promise<ClPage<CnChatMessage>> {
    return this.findPaginated(
      page,
      size,
      {
        where: {
          folderHierarchyId: folderId,
        },
        order: {
          createdAt: 'DESC' as any,
        },
      },
      this.repository.manager
    );
  }

  async updateMessage(message: CnChatMessage, richText: TeRichText): Promise<CnChatMessage> {
    message.content = richText.toJson();
    return await this.update(message as CnChatMessageEntity);
  }

  async saveMessageImage(file: BlFile, folder: CnHierarchyObject): Promise<TeBlockFigureUploadedResponse> {
    return this.documentService.uploadImageDocument(file, folder, CnDocumentType.MESSAGE_CONTENT, folder.id);
  }

  async deleteByFolderId(folderId: string, entityManager: EntityManager): Promise<void> {
    await entityManager.delete(CnChatMessageEntity, { folderHierarchyId: folderId });
  }
}
