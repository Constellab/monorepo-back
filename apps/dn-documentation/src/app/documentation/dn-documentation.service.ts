import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { version } from 'punycode';
import { Repository } from 'typeorm';
import { VersionService } from '../version/dn-version.service';
import { Documentation } from './dn-documentation.entity';

@Injectable()
export class DocumentationService {
  constructor(
    @InjectRepository(Documentation)
    private documentationsRepository: Repository<Documentation>,
    private versionService: VersionService
  ){}

  create(createDocumentationRes: Documentation): Promise<Documentation> {
    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content,
      path: createDocumentationRes.path,

    }
    return this.documentationsRepository.save(createDocumentation);
  }

  findAll(): Promise<Documentation[]> {
    return this.documentationsRepository.find();
  }

  findOne(id: string): Promise<Documentation> {
    return this.documentationsRepository.findOne(id);
  }

  update(updateDocumentation: Documentation): Promise<Documentation> {
    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
