import { HnTechnicalFolderDto } from '../../../technical-folder/hn-technical-folder.dto';
import { HnBaseDto } from './hn-base.dto';
import { HnGeneratedDocEntity, HnGeneratedDocTypingEntity } from './hn-generated-doc-typing.entity';

export class HnSimpleGeneratedDocDto extends HnBaseDto {
  brickName: string;
  brickMajor: number;
  uniqueName: string;
  humanName: string;

  constructor(generatedDocEntity: HnGeneratedDocEntity) {
    super(generatedDocEntity);
    this.brickName = generatedDocEntity.brickName;
    this.brickMajor = generatedDocEntity.brickMajor;
    this.uniqueName = generatedDocEntity.uniqueName;
    this.humanName = generatedDocEntity.humanName;
  }
}

export class HnGeneratedDocDto extends HnSimpleGeneratedDocDto {
  doc?: string | null;
  technicalFolder?: HnTechnicalFolderDto;
  style?: Record<string, any> | null;
  typingName?: string;
  parentHumanName?: string | null;
  parentTypingName?: string | null;
  parentMajorVersion?: number | null;
  parentVersion?: string | null;
  deprecatedSince?: string | null;
  deprecatedMessage?: string | null;
  objectSubType?: string | null;
  objectType?: string;

  constructor(generatedDocEntity: HnGeneratedDocEntity) {
    super(generatedDocEntity);
    this.doc = generatedDocEntity.doc;
    if (generatedDocEntity.technicalFolder) {
      this.technicalFolder = new HnTechnicalFolderDto(generatedDocEntity.technicalFolder);
    }

    if ((generatedDocEntity as HnGeneratedDocTypingEntity)?.typingName) {
      const typingEntity = generatedDocEntity as HnGeneratedDocTypingEntity;
      this.style = typingEntity.style;
      this.typingName = typingEntity.typingName;
      this.parentHumanName = typingEntity.parentHumanName;
      this.parentTypingName = typingEntity.parentTypingName;
      this.parentMajorVersion = typingEntity.parentMajorVersion;
      this.parentVersion = typingEntity.parentVersion;
      this.deprecatedSince = typingEntity.deprecatedSince;
      this.deprecatedMessage = typingEntity.deprecatedMessage;
      this.objectSubType = typingEntity.objectSubType;
      this.objectType = typingEntity.objectType;
    }
  }
}
