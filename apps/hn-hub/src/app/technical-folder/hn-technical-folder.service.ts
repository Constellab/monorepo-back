import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnTechnicalFolder} from './hn-technical-folder.entity';
import {Repository} from 'typeorm';
import {HnResourceService} from '../resource/hn-resource.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnImportTechnicalDocDTO} from '../brick/hn-brick.dto';
import {HnNode} from '../folder/hn-folder.dto';
import {HnResource} from '../resource/hn-resource.entity';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';

@Injectable()
export class HnTechnicalFolderService {
  constructor(
    @InjectRepository(HnTechnicalFolder)
    private readonly technicalFolderRepository: Repository<HnTechnicalFolder>,
    private resourceService: HnResourceService
  ) {
  }

  async createTechnicalDoc(brickMajorVersion: HnBrickMajorVersion, importFile: HnImportTechnicalDocDTO): Promise<boolean> {
    let technicalFolder: HnTechnicalFolder = await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        }
      }
    });

    if (technicalFolder == null) {
      technicalFolder = new HnTechnicalFolder();
      technicalFolder.brickMajorVersion = brickMajorVersion;
      technicalFolder = await this.technicalFolderRepository.save(technicalFolder);
    }

    let resourcesOk: boolean = false;
    //TODO: Faire pour les autres classes

    resourcesOk = await this.resourceService.createTechnicalDocResources(technicalFolder, importFile.resources);

    return resourcesOk;
  }

  async findTechnicalDoc(brickMajorVersion: HnBrickMajorVersion): Promise<HnNode> {
    const technicalFolder: HnTechnicalFolder = await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        }
      }
    });
    if (technicalFolder) {
      const children: HnNode[] = [];
      //RESOURCES
      const resources: HnResource[] = await this.resourceService.findResources(technicalFolder);
      if (resources && resources.length > 0) {
        const resourceFolder: HnNode = new HnNode(
          'ressourceFolder',
          'Resources',
          'resource',
          'technical-folder/resource/',
          0,
          technicalFolder.id,
          this.addTecDoToNodeFolder(resources, 'ressourceFolder', 'technical-folder/resource/')
        );
        children.push(resourceFolder);
      }
      //TODO: faire pour les autre classes

      return new HnNode(technicalFolder.id, 'Technical Documentation',
        'technical-documentation', 'technical-documentation/',
        0, null, children);
    }
    return null;
  }

  addTecDoToNodeFolder(docs: HnGeneratedDocEntity[], parentId: string, parentCompletePath: string): HnNode[] {
    const nodes: HnNode[] = [];
    let i: number = 0;
    for (const d of docs) {
      const n: HnNode = new HnNode(d.id, d.humanName, d.uniqueName, parentCompletePath + d.uniqueName + '/', i, parentId)
      nodes.push(n);
      i++;
    }
    return nodes;
  }

  async findCurrentTecDoc(brickMajorVersion: HnBrickMajorVersion, path: string): Promise<any> {
    const techFolder: HnTechnicalFolder = await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        }
      }
    });

    const arrayPath: string[] = path.split('/');
    arrayPath.pop();

    const currentTecDocClass: string = arrayPath[1];

    switch (currentTecDocClass) {
      case 'resource':
        return this.resourceService.findCurrentTecDoc(techFolder, arrayPath[2])
      default:
        return null;
    }
  }
}
