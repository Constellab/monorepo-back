import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DnVersion } from '../version/dn-version.entity';
import { DnVersionService } from '../version/dn-version.service';
import {DnDocumentation} from './dn-documentation.entity';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,
    private versionService: DnVersionService
  ){}

  async create(createDocumentationRes: DnDocumentation): Promise<DnDocumentation> {

    const version: DnVersion = await this.versionService.getByVersionNumber('1.0.0');
    if(!version){
      throw new NotFoundException();
    }
    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content,
      path: createDocumentationRes.path,
      version: version
    }
    return this.documentationsRepository.save(createDocumentation);
  }

  findAll(): Promise<DnDocumentation[]> {
    return this.documentationsRepository.find();
  }

  findOne(id: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne(id);
  }

  findOneByPath(path: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne({where: {path: path}});
  }

  update(updateDocumentation: DnDocumentation): Promise<DnDocumentation> {
    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
