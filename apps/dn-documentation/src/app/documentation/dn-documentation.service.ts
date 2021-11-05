import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {DnDocumentation, DnDocumentationDTO, DnDocumentationResDTO} from './dn-documentation.entity';
import {DnFolderService} from '../folder/dn-folder.service';
import {DnFolderDTO} from '../folder/dn-folder.entity';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,
    private folderService: DnFolderService
  ) {
  }

  async create(createDocumentationRes: DnDocumentationResDTO): Promise<DnDocumentation> {
    const folder = await this.folderService.findOne(createDocumentationRes.folderId);

    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content,
      path: folder.path + createDocumentationRes.path + '/',
      order: createDocumentationRes.order,
      folder: folder
    }
    return this.documentationsRepository.save(createDocumentation);
  }

  async findAll(): Promise<Array<DnDocumentationDTO | DnFolderDTO>> {
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

        // if(childs.length > 0){
        //   docDto.asChild = true;
        //   docDto.childs = [];
        //   childs.map((child) => {
        //     const docDtoChild = new DnDocumentationDTO(child);
        //     docDto.childs.push(docDtoChild);
        //   })
        // }
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
