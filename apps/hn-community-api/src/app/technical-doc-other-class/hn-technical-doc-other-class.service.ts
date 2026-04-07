import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnImportTechDocOtherClassesDTO } from '../brick-aggregate/brick/hn-brick.dto';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnTechnicalFolder } from '../technical-folder/hn-technical-folder.entity';
import { HnTechnicalDocOtherClass } from './hn-technical-doc-other-class.entity';

@Injectable()
export class HnTechnicalDocOtherClassService {
  constructor(
    @InjectRepository(HnTechnicalDocOtherClass)
    private readonly techDocOtherClassesRepository: Repository<HnTechnicalDocOtherClass>
  ) {}

  async deleteByTechnicalFolder(technicalFolderId: string): Promise<void> {
    await this.techDocOtherClassesRepository.delete({ technicalFolder: { id: technicalFolderId } });
  }

  async createTechnicalDocOtherClasses(
    technicalFolder: HnTechnicalFolder,
    otherClasses: HnImportTechDocOtherClassesDTO[]
  ): Promise<boolean> {
    // Deduplicate by name, last entry wins
    const deduped = [...new Map(otherClasses.map((oC) => [oC.name, oC])).values()];

    for (const oC of deduped) {
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
          id: technicalFolderId,
        },
      },
      order: {
        uniqueName: 'ASC',
      },
    });
  }

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<HnGeneratedDocEntity> {
    const resource: HnTechnicalDocOtherClass = await this.techDocOtherClassesRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id,
      },
      uniqueName: uniqueName,
    });
    if (resource != null) {
      resource.objectType = 'OTHER_CLASS';
    }
    return resource;
  }

  async findTechnicalDocOtherClassById(id: string): Promise<HnTechnicalDocOtherClass> {
    return this.techDocOtherClassesRepository.findOneBy({ id });
  }
}
