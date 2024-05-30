import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnTechnicalFolder} from '../technical-folder/hn-technical-folder.entity';
import {HnImportTechDocOtherClassesDTO} from '../brick-aggregate/brick/hn-brick.dto';
import {HnTechnicalDocOtherClass} from './hn-technical-doc-other-class.entity';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc-typing.entity';

@Injectable()
export class HnTechnicalDocOtherClassService {
  constructor(@InjectRepository(HnTechnicalDocOtherClass)
              private readonly techDocOtherClassesRepository: Repository<HnTechnicalDocOtherClass>,) {
  }

  async createTechnicalDocOtherClasses(technicalFolder: HnTechnicalFolder,
                                       otherClasses: HnImportTechDocOtherClassesDTO[]): Promise<boolean> {

    const oldTechDocOtherClasses: HnTechnicalDocOtherClass[] = await this.techDocOtherClassesRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolder.id
        }
      }
    });

    for (const r of oldTechDocOtherClasses) {
      await this.techDocOtherClassesRepository.delete(r.id);
    }

    for (const oC of otherClasses) {
      const otherClass = new HnTechnicalDocOtherClass();
      otherClass.uniqueName = oC.name;
      otherClass.humanName = oC.name;
      otherClass.doc = oC.doc;
      otherClass.brickName = technicalFolder.brickMajorVersion.brick.name;
      otherClass.technicalFolder = technicalFolder;
      otherClass.brickMajor = technicalFolder.brickMajorVersion.major;
      otherClass.methods = oC.methods;
      otherClass.variables = oC.variables;

      await this.techDocOtherClassesRepository.save(otherClass);
    }

    return true;
  }


  async findTechnicalDocOtherClasses(technicalFolderId: string): Promise<HnTechnicalDocOtherClass[]> {
    return this.techDocOtherClassesRepository.find({
      where: {
        technicalFolder: {
          id: technicalFolderId
        }
      },
      order: {
        uniqueName: 'ASC'
      }
    });
  }

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<HnGeneratedDocEntity> {

    const resource: HnTechnicalDocOtherClass = await this.techDocOtherClassesRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id
      },
      uniqueName: uniqueName
    });
    if (resource != null) {
      resource.objectType = 'OTHER_CLASS';
    }
    return resource;
  }
}
