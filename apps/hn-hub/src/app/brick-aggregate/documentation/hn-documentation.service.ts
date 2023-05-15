import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from './hn-documentation.entity';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnUser} from '../../users/hn-user.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {
  BlBucketConfig,
  BlFile,
  BlImageHelper,
  BlObjectStorageService,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import imageSize from 'image-size';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {
  CmRichText,
  CmRichTextHeader,
  CmRichTextI,
  CmRichTextImageCP,
  CmRichTextLink,
  CmRichTextUploadedImage
} from '@monorepo/common-model';
import {HnFolder} from '../folder/hn-folder.entity';
import {ISizeCalculationResult} from 'image-size/dist/types/interface';
import {ClStringHelper} from '@monorepo/core-lib';

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

  findById(id: string): Promise<HnDocumentation> {
    return this.documentationsRepository.findOne({
      where: {id},
      relations: {
        folder: true
      }
    });
  }

  async update(updatedDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(
      {where: {id: updatedDocumentation.id}, relations: {folder: true}});
    doc.path = updatedDocumentation.title.toLowerCase().trim();
    doc.path = doc.path.replace(/ /gi, '-');
    doc.path = doc.path.replace(new RegExp(/[&?~/|\\'"[()\]%!§:;.,*^¨}{@°`]/g), '');
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

    const documentation: HnDocumentation = await this.documentationsRepository.findOneBy({
      completePath: path,
      folder: {brickMajorVersion: {id: brickMajorVersion.id}}
    });


    if (documentation && documentation.content && documentation.content.ops) {
      const links: CmRichTextLink[] = CmRichText.getLinks(documentation.content as CmRichTextI);

      for (const l of links) {
        if (l.attributes.id) {
          const linkDoc: HnDocumentation = await this.documentationsRepository.findOneBy({id: l.attributes.id});

          if (linkDoc) {
            const insert: string[] = l.insert.split('> ');
            let path: string = linkDoc.completePath.slice(0, -1);
            if (insert.length > 1) {
              l.insert = linkDoc.title + ' > ' + insert[1];
              path += '#' + insert[1];
            } else {
              l.insert = linkDoc.title;
            }
            linkDoc.completePath = path;

            // eslint-disable-next-line max-len
            l.attributes.link = this.configService.getFrontDocUrl(linkDoc);

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
    const doc: HnDocumentation = await this.documentationsRepository.findOneBy({id: id});
    if (doc) {
      doc.content = await this.transformContent(updateContentDoc);

      const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
      if (!currentUser.isAdmin()) {
        throw new BlUnauthorizedException();
      }
    }
    return this.documentationsRepository.save(doc);
  }

  async transformContent(content: CmRichTextI): Promise<CmRichTextI> {
    // Transform intern link with updated url
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

    // Add id to header
    const headers: CmRichTextHeader[] = CmRichText.getHeaders(content);
    const listId: string[] = [];
    for (const h of headers) {
      if (h.attributes.header.id) {
        h.attributes.header.id = ClStringHelper.toIdForUrl(h.attributes.header.id);
        if (h.attributes.header.id.length > 0) {
          const sameTitleNumber: number = listId.filter(value => value == h.attributes.header.id).length;
          listId.push(h.attributes.header.id);
          if (sameTitleNumber > 0) {
            h.attributes.header.id = h.attributes.header.id + sameTitleNumber;
          }
        } else {
          delete h.attributes.header.id;
        }
      }
    }

    return content;
  }

  async getDocumentationIdAndCPByUrl(link: string[]): Promise<[string, string]> {
    const brickName: string = link[1];
    const majorVersion: number = link[2] != 'latest' ? +(link[2].slice(1)) : null;
    link.splice(0, 4);
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

    const documentations: HnDocumentation[] = await this.documentationsRepository.find({
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
    let documentation: HnDocumentation;
    if (documentations.length > 1) {
      //sort by major version
      documentation = documentations.sort((a, b) => a.folder.brickMajorVersion.major - b.folder.brickMajorVersion.major)[0];
    } else {
      if (documentations.length == 1) {
        documentation = documentations[0];
      }
    }

    return [documentation.id, anchor ? completePath.slice(0, -1) + '#' + anchor : completePath];
  }

  async saveImage(file: BlFile): Promise<CmRichTextUploadedImage> {
    const imSize = BlImageHelper.getImageSize(file);
    const filename = await this.objectStorageService.uploadObject(
      this.getBucketConfig(), file, {generateRandomObjectName: true});

    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height
    };
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
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
    } : null;
  }

  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getDocImageObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials()
    };
  }
}
