import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnResource} from './hn-resource.entity';
import {Repository} from 'typeorm';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportResourceDTO} from '../brick/hn-brick.dto';
import {HnDocumentation} from '../documentation/hn-documentation.entity';

@Injectable()
export class HnResourceService {
  constructor(
    @InjectRepository(HnResource)
    private readonly resourceRepository: Repository<HnResource>,
  ) {
  }

  async createTechnicalDocResources(technicalFolder: HnTechnicalFolder, resources: HnImportResourceDTO[]): Promise<boolean> {

    const oldResources: HnResource[] = await this.resourceRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      }
    });

    for(const r of oldResources){
      await this.resourceRepository.delete(r);
    }

    for(const r of resources) {
      const resource = new HnResource();
      resource.doc = r.doc;
      resource.brickName = technicalFolder.brickMajorVersion.brick.name;
      resource.technicalFolder = technicalFolder;
      resource.hide = r.hide;
      resource.brickMajor = technicalFolder.brickMajorVersion.major;
      resource.uniqueName = r.unique_name;

      resource.className = r.class_name;
      resource.humanName = r.human_name;

      //TODO A MODIFIER pour le parent et deprecatedSince

      if(r.parent){
        resource.parentUniqueName = r.parent.unique_name;
      }

      resource.deprecatedMessage = r.deprecated_message;
      resource.shortDescription = r.short_description;

      await this.resourceRepository.save(resource);
    };

    return true;
  }


  async findResources(technicalFolder: HnTechnicalFolder): Promise<HnResource[]>{
    return this.resourceRepository.find({
      where:{
        technicalFolder:{
          id: technicalFolder.id
        }
      }
    });
  }

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string, completePath: string): Promise<HnDocumentation>{

    const resource: HnResource = await this.resourceRepository.findOne({
      technicalFolder: {
        id: tecFolder.id
      },
      uniqueName: uniqueName
    });

    if(resource){
      const doc: HnDocumentation = new HnDocumentation();
      doc.id = resource.id;
      doc.path = resource.uniqueName;
      doc.completePath = completePath;
      doc.content = {ops: [{insert: resource.doc}]};
      doc.title = resource.humanName;
      doc.order = 0;
      doc.folder = null;
      doc.createdAt = null;
      doc.createdBy = null;
      doc.lastModifiedBy = null;
      doc.lastModifiedAt = null;
      return doc;
    }

    return null;


  }
}
