import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnImportResourceDTO } from '../brick-aggregate/brick/hn-brick.dto';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnTechnicalFolder } from '../technical-folder/hn-technical-folder.entity';
import { HnResource } from './hn-resource.entity';

@Injectable()
export class HnResourceService {
  constructor(
    @InjectRepository(HnResource)
    private readonly resourceRepository: Repository<HnResource>
  ) {}

  async deleteByTechnicalFolder(technicalFolderId: string): Promise<void> {
    await this.resourceRepository.delete({ technicalFolder: { id: technicalFolderId } });
  }

  async createTechnicalDocResources(
    technicalFolder: HnTechnicalFolder,
    resources: HnImportResourceDTO[]
  ): Promise<boolean> {
    // Deduplicate by unique_name, last entry wins
    const deduped = [...new Map(resources.map((r) => [r.unique_name, r])).values()];

    for (const r of deduped) {
      const resource = new HnResource();
      resource.shortDescription = r.short_description ? r.short_description : null;
      resource.doc = r.doc;
      resource.brickName = technicalFolder.brickMajorVersion.brick.name;
      resource.technicalFolder = technicalFolder;
      resource.hide = r.hide;
      resource.brickMajor = technicalFolder.brickMajorVersion.major;
      resource.uniqueName = r.unique_name;
      resource.typingName = r.typing_name;
      resource.humanName = r.human_name;
      resource.style = r.style;
      resource.methods = r.methods;
      resource.variables = r.variables ?? null;

      //TODO A MODIFIER pour le parent et deprecatedSince

      if (r.parent) {
        resource.parentTypingName = r.parent.typing_name;
        resource.parentHumanName = r.parent.human_name;
        resource.parentMajorVersion = +r.parent.brick_version.split('.')[0];
        resource.parentVersion = r.parent.brick_version;
      }
      resource.deprecatedSince = r.deprecated_since;
      resource.deprecatedMessage = r.deprecated_message;
      resource.shortDescription = r.short_description;
      resource.objectSubType = r.object_sub_type;

      await this.resourceRepository.save(resource);
    }

    return true;
  }

  async findResources(technicalFolderId: string): Promise<HnResource[]> {
    return this.resourceRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolderId,
        },
      },
      order: {
        humanName: 'ASC',
      },
    });
  }

  async findCurrentTecDoc(
    tecFolder: HnTechnicalFolder,
    uniqueName: string
  ): Promise<HnGeneratedDocEntity | null> {
    const resource: HnResource | null = await this.resourceRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id,
      },
      uniqueName: uniqueName,
    });
    if (resource != null) {
      resource.objectType = 'RESOURCE';
    }
    return resource;
  }

  async findTechDocById(id: string): Promise<HnResource | null> {
    return this.resourceRepository.findOneBy({ id });
  }
}
