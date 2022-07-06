import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnTechnicalFolder} from './hn-technical-folder.entity';
import {Repository} from 'typeorm';
import {HnResourceService} from '../resource/hn-resource.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnImportTechnicalDocDTO, HnTechnicalDocInputDTO} from '../brick/hn-brick.dto';
import {HnNode} from '../folder/hn-folder.dto';
import {HnResource} from '../resource/hn-resource.entity';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnTaskService} from '../task/hn-task.service';
import {HnTask} from '../task/hn-task.entity';
import {HnProtocol} from '../protocol/hn-protocol.entity';
import {HnProtocolService} from '../protocol/hn-protocol.service';
import {HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';

@Injectable()
export class HnTechnicalFolderService {
  constructor(
    @InjectRepository(HnTechnicalFolder)
    private readonly technicalFolderRepository: Repository<HnTechnicalFolder>,
    private resourceService: HnResourceService,
    private taskService: HnTaskService,
    private protocolService: HnProtocolService
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
    let tasksOk: boolean = false;
    let protocolsOk: boolean = false;
    //TODO: Faire pour les autres classes

    if (importFile.resources && importFile.resources.length > 0)
      resourcesOk = await this.resourceService.createTechnicalDocResources(technicalFolder, importFile.resources);
    if (importFile.tasks && importFile.tasks.length > 0)
      tasksOk = await this.taskService.createTechnicalDocTasks(technicalFolder, importFile.tasks);
    if (importFile.protocols && importFile.protocols.length > 0)
      protocolsOk = await this.protocolService.createTechnicalDocProtocols(technicalFolder, importFile.protocols);

    return resourcesOk && tasksOk && protocolsOk;
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
          this.addTechDocToNodeFolder(resources, 'ressourceFolder', 'technical-folder/resource/')
        );
        children.push(resourceFolder);
      }

      //TASKS
      const tasks: HnTask[] = await this.taskService.findTasks(technicalFolder);
      if (tasks && tasks.length > 0) {
        const taskFolder: HnNode = new HnNode(
          'taskFolder',
          'Tasks',
          'task',
          'technical-folder/task/',
          0,
          technicalFolder.id,
          this.addTechDocToNodeFolder(tasks, 'taskFolder', 'technical-folder/task/')
        );
        children.push(taskFolder);
      }

      //PROTOCOLS
      const protocols: HnProtocol[] = await this.protocolService.findProtocols(technicalFolder);
      if (protocols && protocols.length > 0) {
        const protocolFolder: HnNode = new HnNode(
          'protocolFolder',
          'Protocols',
          'protocol',
          'technical-folder/protocol/',
          0,
          technicalFolder.id,
          this.addTechDocToNodeFolder(protocols, 'protocolFolder', 'technical-folder/protocol/')
        );
        children.push(protocolFolder);
      }
      //TODO: faire pour les autres classes

      return new HnNode(technicalFolder.id, 'Technical Documentation',
        'technical-documentation', 'technical-documentation/',
        0, null, children);
    }
    return null;
  }

  addTechDocToNodeFolder(docs: HnGeneratedDocEntity[], parentId: string, parentCompletePath: string): HnNode[] {
    const nodes: HnNode[] = [];
    let i: number = 0;
    for (const d of docs) {
      const n: HnNode = new HnNode(d.id, d.humanName, d.uniqueName, parentCompletePath + d.uniqueName + '/', i, parentId)
      nodes.push(n);
      i++;
    }
    return nodes;
  }

  async findCurrentTecDoc(brickMajorVersion: HnBrickMajorVersion, input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    const techFolder: HnTechnicalFolder = await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        }
      }
    });
    switch (input.techDocType) {
      case 'resource':
        return this.resourceService.findCurrentTecDoc(techFolder, input.techDocUniqueName)
      case 'task':
        return this.taskService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      case 'protocol':
        return this.protocolService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      default:
        return null;
    }
  }

  async getTechDocsByBrickNameMajor(brickMajorVersion: HnBrickMajorVersion,
                                    major: string, brickName: string): Promise<HnDocumentationSearchDTO[]>{

    const parentNode: HnNode = await this.findTechnicalDoc(brickMajorVersion);

    let res: HnDocumentationSearchDTO[] = [];

    if(parentNode && parentNode.children.length > 0){
      for(const c of parentNode.children){
        res = res.concat(this.getTechDocsForSearch(c, major, brickName));
      }
    }

    return res;

  }

  private getTechDocsForSearch(folder: HnNode, major: string, brickName: string): HnDocumentationSearchDTO[]{
    return folder.children.map(doc => {
      return {
        id: doc.id,
        isTechnical: true,
        major: major,
        brickName: brickName,
        completePath: doc.completePath,
        name: doc.name
      }
    });
  }

  async getTechDocByLink(brickMajorVersion: HnBrickMajorVersion, completePath: string, anchor: string): Promise<HnDocumentationSearchDTO>{
    const techFolder: HnTechnicalFolder = await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id
        }
      }
    });

    const linkBroken: string[] = completePath.split('/');
    let techDoc: HnGeneratedDocEntity;

    switch (linkBroken[1]){
      case 'resource':
        techDoc = await this.resourceService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
      case 'task':
        techDoc = await this.taskService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
      case 'protocol':
        techDoc = await this.protocolService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
    }

    return {
      id: techDoc.id,
      isTechnical: true,
      name: techDoc.humanName,
      major: brickMajorVersion.major.toString(),
      completePath: completePath,
      anchor: anchor,
      brickName: brickMajorVersion.brick.name
    };
  }
}
