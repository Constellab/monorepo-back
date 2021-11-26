import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {DnDocumentation, DnDocumentationDTO} from './dn-documentation.entity';

@Injectable()
export class DnDocumentationService {
  constructor(
    @InjectRepository(DnDocumentation)
    private documentationsRepository: Repository<DnDocumentation>,
  ) {
  }

  async create(documentation: DnDocumentationDTO): Promise<DnDocumentation> {
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
      if (!doc.path.includes('/')) {
        const docDto = new DnDocumentationDTO(doc);
        docsDto.push(docDto);
      }
    })
    return docsDto;
  }

  findOne(id: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne(id, {relations: ['folder']});
  }

  findOneByPath(path: string): Promise<DnDocumentation> {
    return this.documentationsRepository.findOne({where: {completePath: path + '/'}});
  }

  update(updateDocumentation: DnDocumentation): Promise<DnDocumentation> {

    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }
}
