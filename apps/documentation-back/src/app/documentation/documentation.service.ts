import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documentation } from './documentation.entity';
import { ParsePipe } from '../core/pipes/parse.pipe';

@Injectable()
export class DocumentationService {
  constructor(
    @InjectRepository(Documentation)
    private documentationsRepository: Repository<Documentation>,
  ){}

  create(createDocumentation: Documentation): Promise<Documentation> {
    return this.documentationsRepository.save(createDocumentation);
  }

  findAll(): Promise<Documentation[]> {
    return this.documentationsRepository.find();
  }

  findOne(id: string): Promise<Documentation> {
    return this.documentationsRepository.findOne(id);
  }

  update(id: string, updateDocumentation: Documentation): Promise<Documentation> {
    updateDocumentation.id = id;
    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
