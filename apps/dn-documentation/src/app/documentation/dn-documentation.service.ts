import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnVersion } from '../version/dn-version.entity';
import { DnVersionService } from '../version/dn-version.service';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,
    private versionService: DnVersionService
  ){}

  create(createDocumentationRes: DnDocumentation): Promise<DnDocumentation> {
    let version: DnVersion;
    let doc: Promise<DnDocumentation>;

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

  findAll(): Promise<DnDocumentationDTO[]> {
    return this.documentationsRepository.find();
  }

  findOne(id: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne(id);
  }

  findOneByPath(path: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne({where: {path: path}}).catch();
  }

  update(updateDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
