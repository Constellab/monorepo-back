import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnResource} from './hn-resource.entity';
import {Repository} from 'typeorm';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportResourceDTO} from '../brick-aggregate/brick/hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc-typing.entity';

@Injectable()
export class HnResourceService {
  constructor(@InjectRepository(HnResource)
              private readonly resourceRepository: Repository<HnResource>,) {
  }

  async createTechnicalDocResources(technicalFolder: HnTechnicalFolder, resources: HnImportResourceDTO[]): Promise<boolean> {

    const oldResources: HnResource[] = await this.resourceRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      }
    });

    for (const r of oldResources) {
      await this.resourceRepository.delete(r.id);
    }

    for (const r of resources) {
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
      resource.variables = r.variables;

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
          id: technicalFolderId
        }
      },
      order: {
        humanName: 'ASC'
      }
    });
  }

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<HnGeneratedDocEntity> {

    const resource: HnResource = await this.resourceRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id
      },
      uniqueName: uniqueName
    });
    if (resource != null) {
      resource.objectType = 'RESOURCE';
    }
    return resource;
  }
}
