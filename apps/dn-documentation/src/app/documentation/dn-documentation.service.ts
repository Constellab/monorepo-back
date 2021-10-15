import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {DnVersion} from '../version/dn-version.entity';
import {DnVersionService} from '../version/dn-version.service';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,
    private versionService: DnVersionService
  ) {
  }

  async create(createDocumentationRes: DnDocumentation): Promise<DnDocumentation> {

    const version: DnVersion = await this.versionService.getByVersionNumber('1.0.0');
    if (!version) {
      throw new NotFoundException();
    }
    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content,
      path: createDocumentationRes.path,
      version: version,
      order: createDocumentationRes.order
    }
    return this.documentationsRepository.save(createDocumentation);
  }

  async findAll(): Promise<DnDocumentationDTO[]> {
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

        if(childs.length > 0){
          docDto.asChild = true;
          docDto.childs = [];
          childs.map((child) => {
            const docDtoChild = new DnDocumentationDTO(child);
            docDto.childs.push(docDtoChild);
          })
        }
        docsDto.push(docDto);
      }
    })
    return docsDto;
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
