import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HnDocumentationFile } from './hn-documentation-file.entity';

@Injectable()
export class HnDocumentationFileService {
  constructor(
    @InjectRepository(HnDocumentationFile)
    private readonly docAuthorRepository: Repository<HnDocumentationFile>
  ) {}

  async getDocumentationFilesByDocId(docId: string): Promise<HnDocumentationFile[]> {
    return this.docAuthorRepository.find({ where: { documentation: { id: docId } } });
  }

  async saveDocumentationFile(docFile: HnDocumentationFile): Promise<HnDocumentationFile> {
    return this.docAuthorRepository.save(docFile);
  }

  async deleteDocumentationFile(docFile: HnDocumentationFile): Promise<void> {
    await this.docAuthorRepository.delete(docFile.id);
  }

  async deleteDocumentationFileWithEntityManager(
    docFileId: string,
    entityManager: EntityManager
  ): Promise<void> {
    await entityManager.delete(HnDocumentationFile, docFileId);
  }

  async getDocumentationFile(id: string): Promise<HnDocumentationFile> {
    return this.docAuthorRepository.findOneBy({ id });
  }

  async getDocumentationFileByFileName(fileName: string): Promise<HnDocumentationFile> {
    return this.docAuthorRepository.findOneBy({ fileName: fileName });
  }
}
