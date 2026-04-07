import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnImportTechnicalDocDTO, HnTechnicalDocInputDTO } from '../brick-aggregate/brick/hn-brick.dto';
import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentationSearchDTO } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnNode } from '../brick-aggregate/folder/hn-folder.dto';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnProtocol } from '../protocol/hn-protocol.entity';
import { HnProtocolService } from '../protocol/hn-protocol.service';
import { HnResource } from '../resource/hn-resource.entity';
import { HnResourceService } from '../resource/hn-resource.service';
import { HnTask } from '../task/hn-task.entity';
import { HnTaskService } from '../task/hn-task.service';
import { HnTechnicalDocOtherClass } from '../technical-doc-other-class/hn-technical-doc-other-class.entity';
import { HnTechnicalDocOtherClassService } from '../technical-doc-other-class/hn-technical-doc-other-class.service';
import { HnTechnicalFolder } from './hn-technical-folder.entity';

@Injectable()
export class HnTechnicalFolderService {
  constructor(
    @InjectRepository(HnTechnicalFolder)
    private readonly technicalFolderRepository: Repository<HnTechnicalFolder>,
    private resourceService: HnResourceService,
    private taskService: HnTaskService,
    private protocolService: HnProtocolService,
    private techDocOtherClassService: HnTechnicalDocOtherClassService
  ) {}

  async createTechnicalDoc(
    brickMajorVersion: HnBrickMajorVersion,
    importFile: HnImportTechnicalDocDTO
  ): Promise<boolean> {
    const existingFolder: HnTechnicalFolder = await this.findTechnicalFolder(brickMajorVersion.id);

    if (existingFolder) {
      // Explicitly delete all children before deleting the folder
      await this.resourceService.deleteByTechnicalFolder(existingFolder.id);
      await this.taskService.deleteByTechnicalFolder(existingFolder.id);
      await this.protocolService.deleteByTechnicalFolder(existingFolder.id);
      await this.techDocOtherClassService.deleteByTechnicalFolder(existingFolder.id);
      await this.technicalFolderRepository.remove(existingFolder);
    }

    let technicalFolder = new HnTechnicalFolder();
    technicalFolder.brickMajorVersion = brickMajorVersion;
    technicalFolder = await this.technicalFolderRepository.save(technicalFolder);

    let resourcesOk: boolean = false;
    let tasksOk: boolean = false;
    let protocolsOk: boolean = false;
    let otherClassesOk: boolean = false;

    if (importFile.resources && importFile.resources.length > 0)
      resourcesOk = await this.resourceService.createTechnicalDocResources(
        technicalFolder,
        importFile.resources
      );
    if (importFile.tasks && importFile.tasks.length > 0)
      tasksOk = await this.taskService.createTechnicalDocTasks(technicalFolder, importFile.tasks);
    if (importFile.protocols && importFile.protocols.length > 0)
      protocolsOk = await this.protocolService.createTechnicalDocProtocols(
        technicalFolder,
        importFile.protocols
      );
    if (importFile.other_classes && importFile.other_classes.length > 0)
      otherClassesOk = await this.techDocOtherClassService.createTechnicalDocOtherClasses(
        technicalFolder,
        importFile.other_classes
      );

    return resourcesOk && tasksOk && protocolsOk && otherClassesOk;
  }

  async findTechnicalDoc(brickMajorVersionId: string): Promise<HnNode> {
    const technicalFolder: HnTechnicalFolder = await this.findTechnicalFolder(brickMajorVersionId);

    if (technicalFolder) {
      const children: HnNode[] = [];

      // Parallelize the 4 independent queries
      const [resources, tasks, protocols, otherClasses] = await Promise.all([
        this.resourceService.findResources(technicalFolder.id),
        this.taskService.findTasks(technicalFolder.id),
        this.protocolService.findProtocols(technicalFolder.id),
        this.techDocOtherClassService.findTechnicalDocOtherClasses(technicalFolder.id),
      ]);

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

      if (otherClasses && otherClasses.length > 0) {
        const otherClassesFolder: HnNode = new HnNode(
          'otherClassesFolder',
          'Other Classes',
          'other-classes',
          'technical-folder/other-classes/',
          0,
          technicalFolder.id,
          this.addTechDocToNodeFolder(otherClasses, 'otherClassesFolder', 'technical-folder/other-classes/')
        );
        children.push(otherClassesFolder);
      }

      return new HnNode(
        technicalFolder.id,
        'Technical Documentation',
        'technical-folder',
        'technical-folder/',
        0,
        null,
        children
      );
    }
    return null;
  }

  addTechDocToNodeFolder(
    docs: HnGeneratedDocEntity[],
    parentId: string,
    parentCompletePath: string
  ): HnNode[] {
    const nodes: HnNode[] = [];
    let i: number = 0;
    for (const d of docs) {
      const n: HnNode = new HnNode(
        d.id,
        d.humanName,
        d.uniqueName,
        parentCompletePath + d.uniqueName + '/',
        i,
        parentId
      );
      nodes.push(n);
      i++;
    }
    return nodes;
  }

  async findCurrentTecDoc(
    brickMajorVersion: HnBrickMajorVersion,
    input: HnTechnicalDocInputDTO
  ): Promise<HnGeneratedDocEntity> {
    const techFolder: HnTechnicalFolder = await this.findTechnicalFolder(brickMajorVersion.id);
    switch (input.techDocType) {
      case 'resource':
        return this.resourceService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      case 'task':
        return this.taskService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      case 'protocol':
        return this.protocolService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      case 'other-classes':
        return this.techDocOtherClassService.findCurrentTecDoc(techFolder, input.techDocUniqueName);
      default:
        return null;
    }
  }

  async findTechDocByIdAndType(techDocId: string, techDocType: string): Promise<HnGeneratedDocEntity> {
    switch (techDocType) {
      case 'resources':
      case 'resource':
        return this.resourceService.findTechDocById(techDocId);
      case 'tasks':
      case 'task':
        return this.taskService.findTechDocById(techDocId);
      case 'protocols':
      case 'protocol':
        return this.protocolService.findTechDocById(techDocId);
      case 'other-classes':
        return this.techDocOtherClassService.findTechnicalDocOtherClassById(techDocId);
      default:
        return null;
    }
  }

  async getTechDocsByBrickNameMajor(
    brickMajorVersionId: string,
    majorVersion: string,
    brickName: string
  ): Promise<HnDocumentationSearchDTO[]> {
    const parentNode: HnNode = await this.findTechnicalDoc(brickMajorVersionId);

    let res: HnDocumentationSearchDTO[] = [];

    if (parentNode && parentNode.children.length > 0) {
      for (const c of parentNode.children) {
        res = res.concat(this.getTechDocsForSearch(c, majorVersion, brickName));
      }
    }

    return res;
  }

  private getTechDocsForSearch(folder: HnNode, major: string, brickName: string): HnDocumentationSearchDTO[] {
    return folder.children.map((doc) => {
      return {
        id: doc.id,
        isTechnical: true,
        major: major,
        brickName: brickName,
        completePath: doc.completePath,
        name: doc.name,
      };
    });
  }

  async getTechDocByLink(
    brickMajorVersion: HnBrickMajorVersion,
    completePath: string,
    anchor: string
  ): Promise<HnDocumentationSearchDTO> {
    const techFolder: HnTechnicalFolder = await this.findTechnicalFolder(brickMajorVersion.id);

    const linkBroken: string[] = completePath.split('/');
    let techDoc: HnGeneratedDocEntity;

    switch (linkBroken[1]) {
      case 'resource':
        techDoc = await this.resourceService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
      case 'task':
        techDoc = await this.taskService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
      case 'protocol':
        techDoc = await this.protocolService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
      case 'other-classes':
        techDoc = await this.techDocOtherClassService.findCurrentTecDoc(techFolder, linkBroken[2]);
        break;
    }

    return {
      id: techDoc.id,
      isTechnical: true,
      name: techDoc.humanName,
      major: brickMajorVersion.major.toString(),
      completePath: completePath,
      anchor: anchor,
      brickName: brickMajorVersion.brick.name,
    };
  }

  async findTechDocsByBrickMajor(brickMajorVersionId: string): Promise<HnGeneratedDocEntity[]> {
    const techFolder: HnTechnicalFolder = await this.findTechnicalFolder(brickMajorVersionId);
    if (techFolder == null) return [];

    const resources: HnResource[] = await this.resourceService.findResources(techFolder.id);
    const tasks: HnTask[] = await this.taskService.findTasks(techFolder.id);
    const protocols: HnProtocol[] = await this.protocolService.findProtocols(techFolder.id);
    const otherClasses: HnTechnicalDocOtherClass[] =
      await this.techDocOtherClassService.findTechnicalDocOtherClasses(techFolder.id);

    return [...resources, ...tasks, ...protocols, ...otherClasses];
  }

  async findTechnicalFolder(brickMajorVersionId: string): Promise<HnTechnicalFolder> {
    return await this.technicalFolderRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersionId,
        },
      },
    });
  }

  async findAllTechnicalDocsByBrick(
    technicalFolder: HnTechnicalFolder
  ): Promise<Record<string, HnGeneratedDocEntity[]>> {
    const resources: HnResource[] = await this.resourceService.findResources(technicalFolder.id);
    const tasks: HnTask[] = await this.taskService.findTasks(technicalFolder.id);
    const protocols: HnProtocol[] = await this.protocolService.findProtocols(technicalFolder.id);
    const otherClasses: HnTechnicalDocOtherClass[] =
      await this.techDocOtherClassService.findTechnicalDocOtherClasses(technicalFolder.id);
    return {
      resources: resources,
      tasks: tasks,
      protocols: protocols,
      'other-classes': otherClasses,
    };
  }
}
