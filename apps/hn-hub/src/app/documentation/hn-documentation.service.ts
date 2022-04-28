import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnDocumentation} from './hn-documentation.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnUser} from '../users/hn-user.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import imageSize from 'image-size';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {CmRichTextI} from '@monorepo/common-model';

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

  async create(documentation: HnDocumentation, entityManager?: EntityManager): Promise<HnDocumentation> {
    return entityManager ? await entityManager.save(documentation) : await this.documentationsRepository.save(documentation);
  }

  async findAll(): Promise<Array<HnDocumentation>> {
    return await this.documentationsRepository.find({
      order: {
        order: 'ASC'
      }
    });
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
    return (await this.documentationsRepository.find(
      {
        where: {completePath: path},
        relations: ['folder']
      })).find(d => d.folder.brickMajorVersion.id == brickMajorVersion.id);
  }

  async updateContent(id: string, updateContentDoc: CmRichTextI): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(id);
    if(doc){
      doc.content = updateContentDoc;
      const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
      if (!currentUser.isAdmin()) {
        throw new UnauthorizedException();
      }
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
