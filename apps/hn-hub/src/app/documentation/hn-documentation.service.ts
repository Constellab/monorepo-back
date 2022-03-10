import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationDTO} from './hn-documentation.entity';
import {HnNodeDTO} from '../folder/hn-folder.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnUser} from '../users/hn-user.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import imageSize from 'image-size';

class HnDocImage{
  filename: string;
  width: number;
  height: number;
}

@Injectable()
export class HnDocumentationService {
  constructor(
    @InjectRepository(HnDocumentation)
    private documentationsRepository: Repository<HnDocumentation>,
    private objectStorageService: BlObjectStorageService,
    private configService: HnCoreConfigService
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

  async update(updatedDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(updatedDocumentation.id, {relations: ['folder']});
    doc.path = updatedDocumentation.path;
    doc.title = updatedDocumentation.title;
    doc.completePath = doc.folder.completePath + updatedDocumentation.path + '/';
    return this.documentationsRepository.save(doc);
  }

  async updatePosition(updatedDocumentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(updatedDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }

  async findCurrentDoc(brickMajorVersion: HnBrickMajorVersion, path: string): Promise<HnDocumentation> {
    let currentDoc: HnDocumentation = null;
    const docs: HnDocumentation[] = await this.documentationsRepository.find(
      {
        where: {completePath: path},
        relations: ['folder']
      });
    docs.map((doc: HnDocumentation) => {
      if (doc.folder.brickMajorVersion.id == brickMajorVersion.id) {
        currentDoc = doc;
      }
    });
    return currentDoc;
  }

  async updateContent(id: string, updateContentDoc: Record<string, any>): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(id);
    doc.content = updateContentDoc;
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser.category.includes('ADMIN')) {
      throw new UnauthorizedException();
    }
    return this.documentationsRepository.save(doc);
  }

  async saveImage(files: BlFile[]): Promise<HnDocImage>{
    const docImage: HnDocImage = new HnDocImage();
    for(const file of files){
      const imSize = imageSize(file.buffer);
      docImage.filename = await this.objectStorageService.uploadObject(file, this.getReportBucket(), true);
      docImage.width = imSize.width;
      docImage.height = imSize.height;
    }
    return docImage;
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getReportBucket());
  }

  private getReportBucket(): string {
    return this.configService.getReportObjectStorageBucket();
  }
}
