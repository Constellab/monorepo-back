import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from './hn-documentation.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnUser} from '../users/hn-user.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import imageSize from 'image-size';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {CmRichText, CmRichTextI, CmRichTextImageCP, CmRichTextLink} from '@monorepo/common-model';
import {HnFolder} from '../folder/hn-folder.entity';
import {ISizeCalculationResult} from 'image-size/dist/types/interface';

class HnDocImage {
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
    private configService: HnCoreConfigService,
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
    doc.path = updatedDocumentation.title.toLowerCase().trim();
    doc.path = doc.path.replace(/ /gi, '-');
    doc.title = updatedDocumentation.title;
    doc.completePath = doc.folder.completePath ? doc.folder.completePath + doc.path + '/' : doc.path + '/';
    return this.documentationsRepository.save(doc);
  }

  async updatePosition(updatedDocumentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(updatedDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }

  async findCurrentDoc(brickMajorVersion: HnBrickMajorVersion, path: string): Promise<HnDocumentation> {

    const documentation: HnDocumentation = (await this.documentationsRepository.find(
      {
        where: {completePath: path},
        relations: ['folder']
      })).find(d => d.folder.brickMajorVersion.id == brickMajorVersion.id);

    if (documentation && documentation.content && documentation.content.ops) {
      const links: CmRichTextLink[] = CmRichText.getLinks(documentation.content as CmRichTextI);
      for (const l of links) {
        if (l.attributes.id) {
          const linkDoc: HnDocumentation = await this.documentationsRepository.findOne(l.attributes.id, {relations: ['folder']});
          if (linkDoc) {


            // eslint-disable-next-line max-len
            l.attributes.link = `${this.configService.getFrontRootUrl()}bricks/${linkDoc.folder.brickMajorVersion.brick.name}/v${linkDoc.folder.brickMajorVersion.major}/doc/${l.attributes.link}`;

            documentation.content.ops.find(
              (o: CmRichTextLink) => o.attributes && o.attributes.id && o.attributes.id === l.attributes.id)
              .attributes.link = l.attributes.link;
          }
        }
      }
    }

    return documentation;
  }

  async updateContent(id: string, updateContentDoc: CmRichTextI): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(id);
    if (doc) {
      doc.content = await this.editContent(updateContentDoc);
      const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
      if (!currentUser.isAdmin()) {
        throw new UnauthorizedException();
      }
    }
    return this.documentationsRepository.save(doc);
  }

  async editContent(content: CmRichTextI): Promise<CmRichTextI> {
    const links: CmRichTextLink[] = CmRichText.getLinks(content);
    for (const l of links) {
      if (l.attributes.link.startsWith(this.configService.getFrontRootUrl())) {
        const link: string[] = l.attributes.link.substring(this.configService.getFrontRootUrl().length).split('/');
        if (link[0] === 'bricks' && link[3] === 'doc' && link[4] !== 'technical-folder') {
          const [id, cp] = await this.getDocumentationIdAndCPByUrl(link);
          if (id != null && cp != null) {
            l.attributes.id = id;
            l.attributes.link = cp;
          }
        }
      }
    }
    const imageCP: CmRichTextImageCP[] = CmRichText.getImageCP(content);
    for(const im of imageCP){
      if('image' in im.insert){
        const base64Img: string = im.insert.image.split(',')[1];
        const imgBuffer: Buffer = new Buffer(base64Img, "base64");
        const imgBlFile: BlFile = {
          buffer: imgBuffer,
          encoding: null,
          mimetype: 'image',
          size: null,
          originalname: 'any.png'
        }
        const imgSize: ISizeCalculationResult = imageSize(imgBuffer);
        const imgName: string = await this.objectStorageService.uploadObject(imgBlFile, this.getReportBucket(),true);
        im.insert = {
          figure: {
            filename: imgName,
            height: imgSize.height,
            width: imgSize.width,
            naturalWidth: imgSize.width,
            naturalHeight: imgSize.height
          }
        }
      }
    }
    return content;
  }

  async getDocumentationIdAndCPByUrl(link: string[]): Promise<[string, string]> {
    const brickName: string = link[1];
    const majorVersion: number = 0;//+(link[2].slice(1))
    link.splice(0, 4)
    if (link[link.length - 1] == '') {
      link.pop();
    }
    let completePath: string = link.join('/');
    let anchor: string;
    if (completePath.includes('#')) {
      anchor = completePath.split('#')[1];
      completePath = completePath.split('#')[0];
    }
    completePath = completePath + '/';
    const documentation: HnDocumentation = await this.documentationsRepository.findOne({
      where: {
        completePath: completePath,
        folder: {
          brickMajorVersion: {
            major: majorVersion,
            brick: {
              name: brickName
            }
          }
        }
      },
      relations: ['folder']
    });
    return [documentation.id, anchor ? completePath.slice(0, -1) + '#' + anchor : completePath];
  }

  async saveImage(files: BlFile[]): Promise<HnDocImage> {
    const docImage: HnDocImage = new HnDocImage();
    for (const file of files) {
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

  async updateCompletePath(doc: HnDocumentation, folder: HnFolder): Promise<void> {
    doc.completePath = folder.completePath ? folder.completePath + doc.path + '/' : doc.path + '/';
    await this.documentationsRepository.save(doc);
  }

  async getDocByLink(brickMajorVersion: HnBrickMajorVersion, completePath: string, anchor?: string): Promise<HnDocumentationSearchDTO> {

    const documentation: HnDocumentation = await this.documentationsRepository.findOne({
      where: {
        completePath: completePath,
        folder: {
          brickMajorVersion: {
            id: brickMajorVersion.id
          }
        }
      },
      relations: ['folder']
    });

    return documentation ? {
      id: documentation.id,
      name: documentation.title,
      completePath: documentation.completePath,
      anchor: anchor ? anchor : null,
      major: brickMajorVersion.major.toString(),
      brickName: brickMajorVersion.brick.name
    } : null
  }
}
