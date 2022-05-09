import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnTask} from './hn-task.entity';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportResourceDTO} from '../brick/hn-brick.dto';
import {HnResource} from '../resource/hn-resource.entity';

@Injectable()
export class HnTaskService {
  constructor(
    @InjectRepository(HnTask)
    private readonly resourceRepository: Repository<HnTask>
  ) {
  }

  async createTechnicalDocTasks(technicalFolder: HnTechnicalFolder, resources: HnImportResourceDTO[]): Promise<boolean> {

    const oldResources: HnResource[] = await this.resourceRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      }
    });

    for (const r of oldResources) {
      await this.resourceRepository.delete(r);
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

      resource.className = r.class_name;
      resource.humanName = r.human_name;

      //TODO A MODIFIER pour le parent et deprecatedSince

      if (r.parent) {
        resource.parentUniqueName = r.parent.unique_name;
        resource.parentHumanName = r.parent.human_name;
        resource.parentMajorVersion = +r.parent.brick_version.split('.')[0];
        resource.parentBrickName = r.parent.brick_name;
        resource.parentVersion = r.parent.brick_version;
      }
      resource.deprecatedSince = r.deprecated_since;
      resource.deprecatedMessage = r.deprecated_message;
      resource.shortDescription = r.short_description;

      await this.resourceRepository.save(resource);
    }
    ;

    return true;
  }
}
