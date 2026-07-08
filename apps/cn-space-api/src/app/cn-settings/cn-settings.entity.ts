import { ArrayNotEmpty, IsArray, IsEnum, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Column, Entity } from 'typeorm';

import { CnBrickGWS } from '../cn-bricks/cn-brick.dto';
import { CnCloudProviderName } from '../cn-cloud-providers/cn-cloud-provider.entity';
import { CnBaseEntity } from '../cn-core/model/entities/cn-base.entity';
import { CnLabBillingMode, CnLabDomain } from '../cn-labs/cn-lab.entity';
import { CnLabGreenOptionType } from '../cn-labs/green-option/cn-lab-green-option.entity';
import { CnLabVolumeType } from '../cn-labs/volume/cn-lab-volume-entity';

export class CnServerDecisionTreeOptionDTO {
  title!: string;
  description!: string;
  // if not leaf
  children?: CnServerDecisionTreeOptionDTO[];
  // if leaf
  suggestedServerNames?: string[];
}

export class CnServerDecisionTreeDTO {
  tree!: CnServerDecisionTreeOptionDTO[];
}

export class CnConstellabSuiteAppDTO {
  name!: string;
  emoji!: string;
  background!: string;
  shortDescription!: string;
  communityAppLink?: string;
}

export class CnConstellabSuiteDTO {
  apps!: CnConstellabSuiteAppDTO[];
}

export interface CnRequestAppDTO {
  appName: string;
}

export class CnFreeLabConfigDTO {
  @IsIn(['OVH', 'AZURE', 'OUTSCALE', 'GCP'])
  cloudProvider!: CnCloudProviderName;

  @IsString()
  @IsNotEmpty()
  cloudProviderRegion!: string;

  @IsString()
  @IsNotEmpty()
  cloudProviderInstanceType!: string;

  @IsNumber()
  nbCpus!: number;

  @IsNumber()
  ramSize!: number;

  @IsNumber()
  volumeSize!: number;

  @IsEnum(CnLabVolumeType)
  volumeType!: CnLabVolumeType;

  @IsEnum(CnLabBillingMode)
  billingMode!: CnLabBillingMode;

  @IsEnum(CnLabDomain)
  domain!: CnLabDomain;

  @IsEnum(CnLabGreenOptionType)
  greenOption!: CnLabGreenOptionType;

  @IsNumber()
  greenOptionInactivityDuration!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(CnBrickGWS, { each: true })
  bricks!: CnBrickGWS[];

  @IsNumber()
  hourLimit!: number;

  @IsNumber()
  deletionAfterDays!: number;
}

@Entity('settings')
export class CnSettings extends CnBaseEntity {
  // store a json object use to build the decision tree to select a server when create a lab
  @Column({ type: 'simple-json', nullable: false })
  serverDecisionTree!: CnServerDecisionTreeDTO;

  // store a list of Constellab Suite applications
  @Column({ type: 'simple-json', nullable: true })
  constellabSuite!: CnConstellabSuiteDTO | null;

  // store the free lab configuration
  @Column({ type: 'simple-json', nullable: true })
  freeLabConfig!: CnFreeLabConfigDTO | null;

  public static createDefault(): CnSettings {
    const settings = new CnSettings();
    settings.serverDecisionTree = { tree: [] };
    settings.constellabSuite = { apps: [] };
    settings.freeLabConfig = CnSettings.getDefaultFreeLabConfig();
    return settings;
  }

  public static getDefaultFreeLabConfig(): CnFreeLabConfigDTO {
    return {
      cloudProvider: 'GCP',
      cloudProviderRegion: 'europe-west1-b',
      cloudProviderInstanceType: 'e2-standard-2',
      nbCpus: 2,
      ramSize: 8,
      volumeSize: 100,
      volumeType: CnLabVolumeType.HIGH_SPEED,
      billingMode: CnLabBillingMode.HOURLY,
      domain: CnLabDomain.CONSTELLAB_APP,
      greenOption: CnLabGreenOptionType.STOP_AFTER_INACTIVITY_TIME,
      greenOptionInactivityDuration: 60,
      bricks: [CnBrickGWS.GWS_CORE, CnBrickGWS.GWS_ACADEMY],
      hourLimit: 25,
      deletionAfterDays: 2,
    };
  }
}
