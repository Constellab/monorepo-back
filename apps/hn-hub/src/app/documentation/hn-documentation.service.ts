import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationContentDTO, HnDocumentationDTO} from './hn-documentation.entity';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';

@Injectable()
export class HnDocumentationService {
  constructor(
    @InjectRepository(HnDocumentation)
    private documentationsRepository: Repository<HnDocumentation>,
  ) {
  }

  async create(documentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(documentation);
  }

  async findAll(): Promise<Array<HnDocumentationDTO>> {
    const docsDto: HnDocumentationDTO[] = [];
    const docs: HnDocumentation[] = await this.documentationsRepository.find({
      order: {
        order: 'ASC'
      }
    });
    docs.map((doc) => {
      if (!doc.path.includes('/')) {
        const docDto = new HnDocumentationDTO(doc);
        docsDto.push(docDto);
      }
    })
    return docsDto;
  }

  findOne(id: string): Promise<HnDocumentation> {
    return this.documentationsRepository.findOne(id, {relations: ['folder']});
  }

  update(updateDocumentation: HnDocumentation): Promise<HnDocumentation> {

    return this.documentationsRepository.save(updateDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }

  async findCurrentDoc(brickVersion: HnBrickVersion, path: string): Promise<HnDocumentation>{
    let currentDoc: HnDocumentation = null;
    const docs: HnDocumentation[] = await this.documentationsRepository.find(
      {
        where: {completePath: path},
        relations: ['folder']
      });
    docs.map((doc: HnDocumentation) => {
      if(doc.folder.brickVersion.id == brickVersion.id){
        currentDoc = doc;
      }
    });
    return currentDoc;
  }

  async updateContent(updateContentDoc: HnDocumentationContentDTO): Promise<HnDocumentation>{
    const doc:HnDocumentation = await this.documentationsRepository.findOne(updateContentDoc.id);
    doc.content = updateContentDoc.content;
    return this.documentationsRepository.save(doc);
  }
}
