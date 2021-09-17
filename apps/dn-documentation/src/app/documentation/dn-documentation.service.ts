import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documentation } from './dn-documentation.entity';

@Injectable()
export class DocumentationService {
  constructor(
    @InjectRepository(Documentation)
    private documentationsRepository: Repository<Documentation>,
  ){}

  create(createDocumentationRes: Documentation): Promise<Documentation> {
    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content
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
