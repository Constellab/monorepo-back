import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnImportProtocolDTO } from '../brick-aggregate/brick/hn-brick.dto';
import { HnTechnicalFolder } from '../technical-folder/hn-technical-folder.entity';
import { HnProtocol } from './hn-protocol.entity';

@Injectable()
export class HnProtocolService {
  constructor(
    @InjectRepository(HnProtocol)
    private readonly protocolsRepository: Repository<HnProtocol>
  ) {}

  async deleteByTechnicalFolder(technicalFolderId: string): Promise<void> {
    await this.protocolsRepository.delete({ technicalFolder: { id: technicalFolderId } });
  }

  async createTechnicalDocProtocols(
    technicalFolder: HnTechnicalFolder,
    protocols: HnImportProtocolDTO[]
  ): Promise<boolean> {
    // Deduplicate by unique_name, last entry wins
    const deduped = [...new Map(protocols.map((p) => [p.unique_name, p])).values()];

    for (const p of deduped) {
      const proto = new HnProtocol();
      proto.shortDescription = p.short_description ? p.short_description : null;
      proto.doc = p.doc;
      proto.brickName = technicalFolder.brickMajorVersion.brick.name;
      proto.technicalFolder = technicalFolder;
      proto.hide = p.hide;
      proto.brickMajor = technicalFolder.brickMajorVersion.major;
      proto.typingName = p.typing_name;
      proto.uniqueName = p.unique_name;
      proto.style = p.style;
      proto.humanName = p.human_name;

      //TODO A MODIFIER pour le deprecatedSince

      if (p.parent) {
        proto.parentTypingName = p.parent.typing_name;
        proto.parentHumanName = p.parent.human_name;
        proto.parentMajorVersion = +p.parent.brick_version.split('.')[0];
        proto.parentVersion = p.parent.brick_version;
      }
      proto.deprecatedSince = p.deprecated_since;
      proto.deprecatedMessage = p.deprecated_message;
      proto.shortDescription = p.short_description;
      proto.objectSubType = p.object_sub_type;

      if (p.input_specs && Object.keys(p.input_specs).length > 0) {
        proto.inputSpecs = p.input_specs;
      }

      if (p.output_specs && Object.keys(p.output_specs).length > 0) {
        proto.outputSpecs = p.output_specs;
      }

      if (p.config_specs && Object.keys(p.config_specs).length > 0) {
        proto.configSpecs = p.config_specs;
      }

      if (p.status) {
        proto.status = p.status;
      }

      await this.protocolsRepository.save(proto);
    }

    return true;
  }

  async findProtocols(technicalFolderId: string): Promise<HnProtocol[]> {
    return this.protocolsRepository.find({
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

  async findCurrentTecDoc(tecFolder: HnTechnicalFolder, uniqueName: string): Promise<HnProtocol | null> {
    const proto: HnProtocol | null = await this.protocolsRepository.findOneBy({
      technicalFolder: {
        id: tecFolder.id,
      },
      uniqueName: uniqueName,
    });
    if (proto != null) {
      proto.objectType = 'PROTOCOL';
    }
    return proto;
  }

  async findTechDocById(id: string): Promise<HnProtocol | null> {
    return this.protocolsRepository.findOneBy({ id });
  }
}
