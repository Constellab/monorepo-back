import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {DnDocumentation, DnDocumentationDTO, DnDocumentationResDTO} from './dn-documentation.entity';
import {DnFolderService} from '../folder/dn-folder.service';
import {forwardRef, Inject} from '@angular/core';
import {DnFolder} from '../folder/dn-folder.entity';
import {doc} from 'prettier';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,

  ) {
  }

  async create(documentation: DnDocumentationDTO): Promise<DnDocumentation>{
    return await this.documentationsRepository.save(documentation);
  }

  async findAll(): Promise<Array<DnDocumentationDTO>> {
    const docsDto: DnDocumentationDTO[] = [];
    const docs: DnDocumentation[] = await this.documentationsRepository.find({
      order: {
        order: 'ASC'
      }
    });
    docs.map((doc) => {
      if(!doc.path.includes('/')){
        const docDto = new DnDocumentationDTO(doc);
        const childs: DnDocumentation[] = docs.filter((documentation) => documentation.path.includes(doc.path+'/') && doc.path != '');
        docsDto.push(docDto);
      }
    })
    return docsDto;
  }

  findOne(id: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne(id, {relations: ['folder']});
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
