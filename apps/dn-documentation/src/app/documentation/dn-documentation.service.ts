import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Version } from '../version/dn-version.entity';
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
    let version: Version;
    let doc: Promise<Documentation>;

    this.versionService.getByVersionNumber('1.0.0').then((v) => {
      version = v;
      console.log(version);

      const createDocumentation = {
        title: createDocumentationRes.title,
        content: createDocumentationRes.content,
        path: createDocumentationRes.path,
        version: version
      }
      doc = this.documentationsRepository.save(createDocumentation);
    })

    return doc;
  }

  findAll(): Promise<Documentation[]> {
    return this.documentationsRepository.find();
  }

  findOne(id: string): Promise<Documentation> {
    return this.documentationsRepository.findOne(id);
  }

  findOneByPath(path: string): Promise<Documentation> {
    return this.documentationsRepository.findOne({where: {path: path}}).catch();
  }

  update(updateDocumentation: Documentation): Promise<Documentation> {
    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
